/**
 * Helpers for constructing the message form and parsing its data.
 */

var findWhere = require('lodash.findwhere');
var filter = require('lodash.filter');
var forEach = require('lodash.foreach');
var isArray = require('lodash.isarray');
var isEmpty = require('lodash.isempty');
var isUndefined = require('lodash.isundefined');
var keys = require('lodash.keys');
var startsWith = require('lodash.startswith');

var models = require('../../../models');


/**
 * Parse out the topic options for a given legislator.
 * @param topicElem
 * @param legislator
 */
var parseTopicOptions = function(topicElem, legislator) {
  var options = isArray(topicElem.optionsHash) ?
    topicElem.optionsHash : keys(topicElem.optionsHash);

  return {
    bioguideId: legislator.bioguideId,
    name: legislator.title + '. ' + legislator.lastName,
    options: options,
    optionsHash: topicElem.optionsHash,
    selected: options[0]
  };
};


/**
 * Parse out the county options from a county FormElement.
 * @param countyElem
 * @param addressCounty
 * @returns {{)}}
 */
var parseCountyOptions = function(countyElem, addressCounty) {
  var countyOptions = countyElem.optionsHash;
  // Guess the correct county based on the address.county value
  var selectedCounty = filter(countyOptions, function(countyOption) {
    return addressCounty === countyOption || startsWith(countyOption, addressCounty);
  })[0];

  return {
    selected: isUndefined(selectedCounty) ? countyOptions[0] : selectedCounty,
    options: countyOptions
  };
};


/**
 *
 * @returns {{}}
 */
var makeSenderInfo = function(formData, parensPhone) {

  return {
    namePrefix: formData.prefix,
    firstName: formData.firstName,
    lastName: formData.lastName,
    email: formData.email,
    phone: parensPhone.replace('(', '').replace(')', '').replace(' ', '-'),
    parenPhone: parensPhone,
    county: formData.county
  };

};


/**
 *
 * @param legislator
 * @param formData
 * @param topic An object describing the topics for a legislator, as created by parseTopicOptions.
 * @returns {{}}
 */
var makeMessageInfo = function(legislator, formData, topic) {

  var topicValue = null;
  if (!isUndefined(topic)) {
    topicValue = isArray(topic.optionsHash) ?
      topic.selected : topic.optionsHash[topic.selected];
  }

  // Fill the user's name in the closing
  if (formData.message.indexOf("[Your Name]") > -1) {
    var new_name = formData.firstName + ' ' + formData.lastName;
    formData.message = formData.message.replace("[Your Name]", new_name);
  }

  return {
    topic: topicValue,
    subject: formData.subject,
    message: 'Dear ' + legislator.title + ' ' + legislator.lastName + ', \n' + formData.message
  };

};


/**
 *
 * @returns {{}}
 */
var makeCampaignInfo = function() {

  return {
    uuid: '',
    orgURL: '',
    orgName: ''
  };

};


/**
 *
 * @param legislators
 * @param formData
 * @param phoneValue
 * @param topicOptions
 * @param address
 * @returns {*}
 */
var makeMessage = function(legislator, formData, phoneValue, topicOptions, address) {
  var messageInfo = makeMessageInfo(legislator, formData, topicOptions[legislator.bioguideId]);

  return new models.Message({
    bioguideId: legislator.bioguideId,
    topic: messageInfo.topic,
    subject: messageInfo.subject,
    message: messageInfo.message,
    sender: makeSenderInfo(formData, phoneValue),
    canonicalAddress: address,
    campaign: makeCampaignInfo()
  });
};


/**
 * Gets data to populate a county field from the LegislatorFormElements objects.
 *
 * NOTE: The current contact congress data shows no cases where > 1 rep for a given location supports
 *       county data in their contact form. So, find the first example of county data and use that.
 *       This will need to be updated where > 1 reps adopt county data.
 *
 * @param legislatorsFormElements
 */
var getCountyData = function(legislatorsFormElements, addressCounty) {
  var countyKey = '$ADDRESS_COUNTY';
  var countyElem;

  for (var i = 0, countyElemArr; i < legislatorsFormElements.length; ++i) {
    countyElemArr = filter(legislatorsFormElements[i].formElements, function(formElem) {
      return formElem.value === countyKey;
    });
    if (countyElemArr.length > 0) {
      countyElem = countyElemArr[0];
    }
  }

  var countyData = {};
  if (!isUndefined(countyElem)) {
    countyData = parseCountyOptions(countyElem, addressCounty);
  }

  return countyData;
};


/**
 *
 * @param legislatorsFormElements
 * @param legislators
 * @returns {{}}
 */
var getTopicOptions = function(legislatorsFormElements, legislators) {
  var topicKey = '$TOPIC';
  var topicOptions = {};

  var topicElem;
  forEach(legislatorsFormElements, function(legislatorFormElems) {
    topicElem = filter(legislatorFormElems.formElements, function(formElem) {
      return formElem.value === topicKey;
    })[0];

    if (!isUndefined(topicElem)) {
      topicElem = parseTopicOptions(
        topicElem,
        findWhere(legislators, {bioguideId: legislatorFormElems.bioguideId})
      );
      topicOptions[legislatorFormElems.bioguideId] = topicElem;
    }
  });

  return topicOptions;
};


/**
 * Create supplementary form fields from the LegislatorFormElements models.
 */
var createFormFields = function(legislatorsFormElements, legislators, address) {
  var countyData = getCountyData(legislatorsFormElements, address.county);

  var prefilledMessage = "As a supporter of US science and a constituent, I urge Congress to cement America's global economic and innovation leadership by making reliable investments in the science, engineering, and technology enterprise.\n\nThe President’s proposed budget would severely cripple US science and innovation. I urge you to work with your colleagues to support US science and enact federal research and development appropriations at the highest funding levels possible.\n\nAddressing America's long-term fiscal challenges requires a strong, competitive economy. Now more than ever, our competitiveness depends on a robust research and development engine, which starts with the basic science supported overwhelmingly by federal funding. The recent large year-to-year fluctuations have harmed science, by launching projects but not funding their completion, or by forcing promising young researchers to leave our workforce.  The proposed budget cuts would effect a massive decline in funding that would certainly cause job loss, destabilize the scientific enterprise, and waste tax payer money by stalling research projects. Rigid restrictions on year-to-year spending have been short-sighted, have increased the United States' innovation deficit, and will constrain our economic growth in coming decades. Ultimately, stable funding for research creates jobs and develops the technologies that enhance Americans' quality of life. I urge you to support steady and sustained real growth in research funding to enable tomorrow's discoveries and foster U.S. innovation and global competitiveness.\n\nSincerely,\n[Your Name]";

  var formFieldData = {
    countyData: countyData,
    formData: {
      prefix: 'Ms',
      county: countyData.selected,
      subject: 'Funding for Academic Research',
      message: prefilledMessage
    },
    topicOptions: getTopicOptions(legislatorsFormElements, legislators)
  };

  return formFieldData;
};


/**
 * Send the messages to the PHP logging script.
 */
var logMessages = function(messages) {
  var script_location = "/aftfos_scripts/log_messages_server.php";
  var json_message_data = JSON.stringify(messages);

  $.ajax({
    type: "POST",
    dataType: "json",
    url: script_location,
    data: { data : json_message_data },
    success: function(data) {
    }
  });

  return true;
};

/**
 * Send the responses to the PHP logging script.
 */
var logResponses = function(messageResponses) {
  var script_location = "/aftfos_scripts/message_database_responses.php";
  var json_message_data = JSON.stringify(messageResponses);

  $.ajax({
    type: "POST",
    dataType: "json",
    url: script_location,
    data: { data : json_message_data },
    success: function(data) {
    }
  });

  return true;
};


module.exports.createFormFields = createFormFields;

module.exports.getCountyData = getCountyData;
module.exports.parseCountyOptions = parseCountyOptions;

module.exports.getTopicOptions = getTopicOptions;
module.exports.parseTopicOptions = parseTopicOptions;

module.exports.makeMessage = makeMessage;
module.exports.makeSenderInfo = makeSenderInfo;
module.exports.makeMessageInfo = makeMessageInfo;
module.exports.makeCampaignInfo = makeCampaignInfo;

module.exports.logMessages = logMessages;
module.exports.logResponses = logResponses;
