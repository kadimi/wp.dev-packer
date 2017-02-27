const del        = require('del');
const download   = require('gulp-download');
const fileExists = require('file-exists');
const gulp       = require('gulp');
const spawn      = require('child_process').spawn;
const remoteSrc  = require('gulp-remote-src');

/**
 * Default task.
 *
 * - Maybe download vagrant insecure key pair
 * - Build machine
 */
gulp.task('default', () => {
    gulp.start('build', ['keys']);
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
 * Re-downloads vagrant key pair if at least one key is missing
 */
gulp.task('keys', () => {
    if (!fileExists.sync('vendor/vagrant/keys/vagrant') || !fileExists.sync('vendor/vagrant/keys/vagrant.pub')) {
        remoteSrc(['vagrant', 'vagrant.pub'], {base: 'https://raw.githubusercontent.com/mitchellh/vagrant/master/keys/'}).pipe(gulp.dest('vendor/vagrant/keys/'));
    }
});

/**
 * Deletes cookbooks dependencies, artifacts and cache
 */
gulp.task('clean', () => {
    del([
        'cookbooks/wp.dev/vendor',
        'cookbooks/wp.dev/Berksfile.lock',
        'vendor',
        'output-',
        'packer_cache'
    ]);
});
