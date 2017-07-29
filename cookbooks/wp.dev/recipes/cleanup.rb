script 'cleanup' do
	interpreter "bash"
	code <<-EOH
		rm -fr /opt/VBoxGuestAdditions*
		rm -rf /var/lib/apt/lists/*
		dd if=/dev/zero of=/EMPTY bs=1M
		rm -f /EMPTY
	EOH
end
