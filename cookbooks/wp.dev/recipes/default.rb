include_recipe 'apt'
include_recipe 'wp.dev::apache2'
include_recipe 'wp.dev::mariadb'
include_recipe 'wp.dev::php'
include_recipe 'wp.dev::cleanup'
