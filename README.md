# save-science.org

## Prerequisites for local development.
You'll need the following software. On OS X the easiest way to to install these
is probably via [homebrew](https://brew.sh/). 
   - VirtualBox
   - Vagrant
   - Ansible

Instructions for commandline:
 * Clone this repositiory.
 
    `git clone https://github.com/gehrman/afs_website`
 
 * Change directory into the checkout:
 
    `cd afs_website`
    
 * Install the ansible roles (I'll try to get rid of this step):

    `ansible-galaxy install -r provisioning/requirements.yml`
    
 * Create the vagrant box:
    
    `vagrant up`

Once this completes, visit http://localhost:8080 in your favorite browser. You
should see the save-science landing page.
