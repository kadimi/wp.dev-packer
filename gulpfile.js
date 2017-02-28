const del         = require('del');
const fileExists  = require('file-exists');
const gulp        = require('gulp');
const mkdirp      = require('mkdirp');
const rename      = require('gulp-rename');
const remoteSrc   = require('gulp-remote-src');
const runSequence = require('run-sequence');
const spawn       = require('child_process').spawn;

/**
 * Default task does nothing
 */
gulp.task('default', ()=> {
  spawn('gulp', ['clean'], {stdio: 'inherit'}).on('close', () => {
    spawn('gulp', ['dl'], {stdio: 'inherit'}).on('close', () => {
      spawn('gulp', ['berks'], {stdio: 'inherit'}).on('close', () => {
        spawn('gulp', ['build'], {stdio: 'inherit'}).on('close', function (code) {
          console.log('`gulp build` process exited with code ' + code);
        });
      });
    });
  });
});

/**
 * Builds machine
 *
 * Runs `packer build -force template.json`
 */
gulp.task('build', () => {
  spawn('packer', ['build', '-force', 'template.json'], {stdio: 'inherit'}).on('close', function (code) {
    console.log('`packer build` process exited with code ' + code);
  });
});

/**
 * Add box if it exists
 *
 * @todo "...if exists"
 */
gulp.task('box-add', () => {
  spawn('vagrant', ['box', 'add', 'packer_vagrant_virtualbox.box', '--name', 'wp.dev', '--force'], {stdio: 'inherit'}).on('close', function (code) {
    console.log('`vagrant box add` process exited with code ' + code);
  });
});

/**
 * Launch a new Vagrant box
 */
gulp.task('box-launch', () => {
  mkdirp('vm');
  process.chdir('vm');
  spawn('vagrant', ['init', 'wp.dev', '-f'], {stdio: 'inherit'}).on('close', function (code) {
    process.chdir('vm');
    spawn('vagrant', ['up'], {stdio: 'inherit'}).on('close', function (code) {
      console.log('`vagrant up` process exited with code ' + code);
    });
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
  spawn('berks', ['vendor', 'vendor/cookbooks'], {stdio: 'inherit'}).on('close', function (code) {
    console.log('`berks vendor` process exited with code ' + code);
  });
  process.chdir('../..');
});

/**
 * Downloads Vagrant key pair if at least one key is missing
 */
gulp.task('dl-keys', () => {
  if (!fileExists.sync('vendor/vagrant/keys/vagrant') || !fileExists.sync('vendor/vagrant/keys/vagrant.pub')) {
    return remoteSrc(['vagrant', 'vagrant.pub'], {base: 'https://raw.githubusercontent.com/mitchellh/vagrant/master/keys/'}).pipe(gulp.dest('vendor/vagrant/keys/'));
  }
  return true;
});

/**
 * Downloads chef insaller.sh
 */
gulp.task('dl-chef', () => {
  if (!fileExists.sync('vendor/chef/chef.deb')) {
    return remoteSrc(['chef_12.19.36-1_amd64.deb'], {base: 'https://packages.chef.io/files/stable/chef/12.19.36/ubuntu/16.04/'})
      .pipe(rename('chef.deb'))
      .pipe(gulp.dest('vendor/chef'))
    ;
  }
  return true;
});

/**
 * Downloads
 */
gulp.task('dl', () => {
  return gulp.start('dl-chef') && gulp.start('dl-keys');
});

/**
 * Deletes cookbooks dependencies, artifacts and cache
 */
gulp.task('clean', () => {
  return del([
    'cookbooks/wp.dev/vendor',
    'cookbooks/wp.dev/Berksfile.lock',
    'output-',
    'packer_cache'
  ]);
});

/**
 * Deletes cookbooks dependencies, artifacts and cache
 */
gulp.task('wipe', () => {
  return del([
    'vendor'
  ]);
});
