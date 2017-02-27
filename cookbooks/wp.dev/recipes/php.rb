include_recipe 'php'

php_pear "xdebug" do
  zend_extensions ['xdebug.so']
  action :install
end