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

## Credentials:
The web-application runs as the science user. Should you need access to the box
as that user, you can run `ssh science@192.168.97.10`.

    * `user`: science

    * `password`: science

To log in as the vagrant user, you can also use `vagrant ssh` from within the
website repository.
