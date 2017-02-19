const del        = require('del');
const download   = require('gulp-download');
const fileExists = require('file-exists');
const gulp       = require('gulp');
const spawn      = require('child_process').spawn;

/**
 * Default task.
 *
 * - Delete existing artifacts
 * - Maybe download vagrant insecure key pair
 * - Build machine
 */
gulp.task('default', () => {
    gulp.start( 'build', ['clean', 'keys']);
});

/**
 * Builds machine
 */
gulp.task('build', function () {
  spawn('packer', ['build', 'template.json'], {stdio: 'inherit'}).on('close', function (code) {
    console.log('Build process exited with code ' + code);
  });
});

/**
 * Redowloads vagrant key pair if at least a key is missing
 */
gulp.task('keys', () => {
    if (!fileExists.sync('keys/vagrant') || !fileExists.sync('keys/vagrant.pub')) {
        download('https://raw.githubusercontent.com/mitchellh/vagrant/master/keys/vagrant').pipe(gulp.dest("keys/"));
        download('https://raw.githubusercontent.com/mitchellh/vagrant/master/keys/vagrant.pub').pipe(gulp.dest("keys/"));
    }
});

/**
 * Deletes existing artifacts
 */
gulp.task('clean', () => {
    del(['output-', 'packer_cache']);
});
