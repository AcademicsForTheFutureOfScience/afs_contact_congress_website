# -*- mode: ruby -*-
# vi: set ft=ruby :

Vagrant.configure("2") do |config|
  config.vm.box = "ubuntu/trusty64"

  config.vm.network "private_network", ip: "192.168.97.10"

  # config.vm.synced_folder "../data", "/mnt/vagrant_data"

  config.vm.provider "virtualbox" do |vb|
     vb.memory = "512"
  end

  config.vm.provision "ansible" do |ansible|
    ansible.playbook = "provisioning/playbook.yml"
  end

end
