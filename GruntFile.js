module.exports = function (grunt) {
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-open');
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        jshint: {
            src: [ "src/js/**/*.js" ]
        },
        copy: {
          deploy: {
            files: [
              { src: "src/css/**", dest: "deploy/css" }
            ]
          }
        },
        concat: {
            deploy: {
                src: "src/js/**/*.js",
                dest: 'deploy/js/<%= pkg.name %>.js'
            }
        },
        connect: {
            server: {
                options: {
                    port: 8080,
                    base: './deploy'
                }
            }
        },
        open: {
            dev: {
                path: 'http://localhost:8080/index.html'
            }
        },
        watch: {
            files: 'src/**/*.*',
            tasks: ['jshint', 'copy', 'concat']
        }
    });

    grunt.registerTask('default', ['jshint', 'copy', 'concat']);
    grunt.registerTask('watch', ['jshint', 'copy', 'concat', 'connect', 'open', 'watch']);

}