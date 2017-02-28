include_recipe 'apache2'

include_recipe 'apache2::mod_rewrite'

apache_site "default" do
  enable true
end
