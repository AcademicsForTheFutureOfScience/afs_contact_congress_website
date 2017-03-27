# -*- mode: ruby -*-
# vi: set ft=ruby :

Vagrant.configure("2") do |config|
  config.vm.box = "ubuntu/trusty64"
  config.vm.hostname = "save-science"
  config.vm.network "forwarded_port", guest: 80, host: 8080
  config.vm.network "private_network", ip: "192.168.97.10"

  config.vm.synced_folder "node", "/mnt/www/node",
    id: "node"
  config.vm.synced_folder "python", "/mnt/www/python",
    id: "python"

  config.vm.provider "virtualbox" do |vb|
     vb.name = "save-science"
     vb.memory = "1536"
  end

  config.vm.provision "ansible" do |ansible|
    ansible.playbook = "provisioning/playbook.yml"
  end

end
