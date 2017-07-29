apt_repository 'php_ppa' do
  uri          'ppa:ondrej/php'
  distribution node['lsb']['codename']
end

apt_package 'php5.6'
apt_package 'php7.0'
apt_package 'php7.1'
apt_package 'php7.2'
