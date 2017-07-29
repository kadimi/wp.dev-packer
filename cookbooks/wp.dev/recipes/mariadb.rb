case node['platform_family']
when 'debian'
	apt_repository 'mariadb' do
		uri "http://ftp.osuosl.org/pub/mariadb/repo/#{node['mariadb']['install']['version']}/#{node['platform']}"
		distribution node['lsb']['codename']
		components ['main']
		# key '0xcbcb082a1bb943db' #The old key.
		key '0xF1656F24C74CD1D8' #The new key starting from Ubuntu 16.04 "Xenial" and Debian Sid.
	end
end

node.set['mariadb']['server_root_password'] = 'root'

include_recipe 'mariadb'
