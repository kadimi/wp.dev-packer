// const box = 'ubuntu/trusty64';
// const box = 'ubuntu/xenial64';
// const box = 'envimation/ubuntu-xenial';
const box = 'bento/ubuntu-16.04';

const del         = require('del');
const fileExists  = require('file-exists');
const gulp        = require('gulp');
const jscs        = require('gulp-jscs');
const mkdirp      = require('mkdirp');
const rename      = require('gulp-rename');
const remoteSrc   = require('gulp-remote-src');
const spawn       = require('child_process').spawn;
const execSync    = require('child_process').execSync;

/**
 * Builds machine.
 */
gulp.task('default', ()=> {
  spawn('gulp', ['clean'], { stdio: 'inherit' }).on('close', () => {
    spawn('gulp', ['dl'], { stdio: 'inherit' }).on('close', () => {
      spawn('gulp', ['berks'], { stdio: 'inherit' }).on('close', () => {
        spawn('gulp', ['build'], { stdio: 'inherit' }).on('close', function (code) {
          console.log('`gulp build` process exited with code ' + code);
        });
      });
    });
  });
});

/**
 * Builds machine
 */
gulp.task('build', ['variables'], () => {
  execSync('packer build -var-file=variables.json -force template.json', { stdio: 'inherit' });
});

/**
 * Make variables file.
 */
gulp.task('variables', () => {
  var boxSlash = box.replace('/', '-VAGRANTSLASH-');
  var boxPath = execSync('find ~/.vagrant.d/boxes/' + boxSlash + ' |grep ovf |sort -rn |head -n 1')
    .toString()
    .trim();
  execSync(`echo "{\\\"box\\\":\\\"${boxPath}\\\"}" > variables.json`);
});

/**
 * Add box if it exists
 *
 * @todo "...if exists"
 */
gulp.task('box-add', () => {
  newBox = 'packer_virtualbox-ovf_virtualbox.box';
  spawn('vagrant', `box add ${newBox} --name wp.dev --force`.split(' '), { stdio: 'inherit' })
    .on('close', function (code) {
      console.log('`vagrant box add` process exited with code ' + code);
    });
});

/**
 * Launch a new Vagrant box
 */
gulp.task('box-launch', () => {
  mkdirp('vm');
  process.chdir('vm');
  spawn('vagrant', ['destroy', '-f'], { stdio: 'inherit' }).on('close', function (code) {
    process.chdir('vm');
    spawn('vagrant', ['init', 'wp.dev', '-f'], { stdio: 'inherit' }).on('close', function (code) {
      process.chdir('vm');
      spawn('vagrant', ['up'], { stdio: 'inherit' }).on('close', function (code) {
        console.log('`vagrant up` process exited with code ' + code);
      });

      process.chdir('..');
    });

    console.log('`vagrant destroy -f` process exited with code ' + code);
    process.chdir('..');
  });

  process.chdir('..');
});

/**
 * Installs cookbooks
 *
 * Runs `berks vendor vendor/cookbooks` from `cookbooks/wp.dev`
 */
gulp.task('berks', () => {
  process.chdir('cookbooks/wp.dev');
  spawn('berks', ['vendor', 'vendor/cookbooks'], { stdio: 'inherit' }).on('close', function (code) {
    console.log('`berks vendor` process exited with code ' + code);
  });

  process.chdir('../..');
});

/**
 * Downloads Vagrant key pair if at least one key is missing
 */
gulp.task('dl-keys', () => {
  var vagrantKeysBase = 'https://raw.githubusercontent.com/mitchellh/vagrant/master/keys/';
  var key = 'vendor/vagrant/keys/vagrant';
  var keyPub = `${key.pub}`;
  if (!fileExists.sync(key) || !fileExists.sync(keyPub)) {
    return remoteSrc(['vagrant', 'vagrant.pub'], { base: vagrantKeysBase })
      .pipe(gulp.dest('vendor/vagrant/keys/'));
  }

  return true;
});

/**
 * Downloads chef insaller.sh
 */
gulp.task('dl-chef', () => {
  if (!fileExists.sync('vendor/chef/chef.deb')) {
    execSync('mkdir -p vendor/chef');
    var chefLink = execSync('sh scripts/get-chef-download-link.sh').toString().trim();
    execSync(`wget -O vendor/chef/chef.deb "${chefLink}"`);
  }
});

/**
 * Downloads vagrant box.
 */
gulp.task('dl-box', () => {
  args = `box add --provider virtualbox ${box}`.split(' ');
  spawn('vagrant', args, { stdio: 'inherit' }).on('close', function (code) {
    console.log('`vagrant up` process exited with code ' + code);
  });
});

/**
 * Downloads
 */
gulp.task('dl', () => gulp.start('dl-chef') && gulp.start('dl-keys') && gulp.start('dl-box'));

/**
 * Deletes cookbooks dependencies, artifacts and cache
 */
gulp.task('clean', () => del([
  'cookbooks/wp.dev/vendor',
  'cookbooks/wp.dev/Berksfile.lock',
  'output-',
  'packer_cache',
]));

/**
 * Deletes cookbooks dependencies, artifacts and cache
 */
gulp.task('wipe', () => del(['vendor']));

// Check syntax.
gulp.task('jscs', () => gulp.src(['gulpfile.js']).pipe(jscs()).pipe(jscs.reporter()));
