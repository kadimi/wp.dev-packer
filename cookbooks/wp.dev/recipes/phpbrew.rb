execute 'phpbrew_01' do
	command 'apt-get build-dep -y php5'
end

execute 'phpbrew_02' do
	command 'apt-get install -y php5 php5-dev php-pear autoconf automake curl libcurl3-openssl-dev build-essential libxslt1-dev re2c libxml2 libxml2-dev php5-cli bison libbz2-dev libreadline-dev'
end

execute 'phpbrew_03' do
	command 'apt-get install -y libfreetype6 libfreetype6-dev libpng12-0 libpng12-dev libjpeg-dev libjpeg8-dev libjpeg8  libgd-dev libgd3 libxpm4 libltdl7 libltdl-dev'
end

execute 'phpbrew_04' do
	command 'apt-get install -y libssl-dev openssl'
end

execute 'phpbrew_05' do
	command 'apt-get install -y gettext libgettextpo-dev libgettextpo0'
end

execute 'phpbrew_06' do
	command 'apt-get install -y libicu-dev'
end

execute 'phpbrew_07' do
	command 'apt-get install -y libmhash-dev libmhash2'
end

execute 'phpbrew_08' do
	command 'apt-get install -y libmcrypt-dev libmcrypt4'
end

execute 'phpbrew_09' do
	command 'curl -L -O https://github.com/phpbrew/phpbrew/raw/master/phpbrew'
end

execute 'phpbrew_10' do
	command 'chmod +x phpbrew'
end

execute 'phpbrew_11' do
	command 'sudo mv phpbrew /usr/local/bin/phpbrew'
end
