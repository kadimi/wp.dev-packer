apt_repository 'mariadb' do
  components ['main']
  distribution 'trusty'
  arch 'amd64'
  keyserver 'keyserver.ubuntu.com'
  key '0xcbcb082a1bb943db'
  uri 'http://nyc2.mirrors.digitalocean.com/mariadb/repo/10.0/ubuntu'
  action :add
  deb_src true
end

include_recipe 'apt'
include_recipe 'wp.dev::apache2'
# include_recipe 'wp.dev::mariadb'
# include_recipe 'wp.dev::phpbrew'
