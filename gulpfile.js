// const box = 'ubuntu/trusty64';
// const box = 'ubuntu/xenial64';
// const box = 'envimation/ubuntu-xenial';
const box = 'bento/ubuntu-16.04';

const del         = require('del');
const execSync    = require('child_process').execSync;
const fs          = require('fs');
const gulp        = require('gulp');
const jscs        = require('gulp-jscs');
const mkdirp      = require('mkdirp');
const spawn       = require('child_process').spawn;
const util        = require('gulp-util');

/**
 * Simple downloader.
 */
const dl = function(url, name, dir='.', force) {
  var path=`${dir}/${name}`;
  var fileExists = false;

  try {
    if ( fs.statSync(path) ) {
      fileExists = true;
    }
  } catch (err) {}

  if ( fileExists && !force ) {
    util.log(`File ${util.colors.cyan(path)} exists, skipping...` );
  } else {
    util.log(`Downloading ${util.colors.cyan(url)} as ${util.colors.cyan(path)}...` );
    execSync(`mkdir -p ${dir}`, { stdio: 'inherit' });
    execSync(`wget -O ${path} "${url}"`, { stdio: 'inherit' });
  }
};

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
  var boxPath = execSync(`find ~/.vagrant.d/boxes/${boxSlash} | grep ovf | sort -rn | head -n 1`)
    .toString()
    .trim();
  fs.writeFileSync('template.x', `{"box":"${boxPath}"}\n`);
  return;
  execSync(`echo "{\\\"box\\\":\\\"${boxPath}\\\"}" > variables.json`);
});

/**...if exists"
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
  execSync('berks vendor vendor/cookbooks', { stdio: 'inherit' });
  process.chdir('../..');
});

/**
 * Downloads Vagrant key pair if at least one key is missing.
 */
gulp.task('dl-keys', () => {
  var vagrantKeysBase = 'https://github.com/mitchellh/vagrant/raw/master/keys/';
  dl(`${vagrantKeysBase}vagrant`, 'vagrant', 'vendor/vagrant/keys');
  dl(`${vagrantKeysBase}vagrant.pub`, 'vagrant.pub', 'vendor/vagrant/keys');
});

/**
 * Downloads chef insaller.sh
 */
gulp.task('dl-chef', () => {
  var chefLink = execSync('sh scripts/get-chef-download-link.sh').toString().trim();
  dl(chefLink, 'chef.deb', 'vendor/chef');
});

/**
 * Downloads or updates vagrant box.
 */
gulp.task('dl-box', () => {
  var boxExists = execSync(`vagrant box list | grep ${box} | wc -l`).toString().trim() == 1;
  if(boxExists){
    util.log(`Updating box ${util.colors.cyan(box)}...` );
    execSync(`vagrant box update --provider virtualbox --box ${box}`, { stdio: 'inherit' });
  } else {
    util.log(`Downloading box ${util.colors.cyan(box)}...` );
    execSync(`vagrant box download --provider virtualbox ${box}`, { stdio: 'inherit' });
  }
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
