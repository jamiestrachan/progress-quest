module.exports = function (grunt) {
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-sass');
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
              { expand: true, cwd: "src/", src: ["*"], dest: "deploy/", filter: "isFile" },
              { expand: true, cwd: "src/img/", src: ["*"], dest: "deploy/img/" }
            ]
          }
        },
        concat: {
            deploy: {
                src: "src/js/**/*.js",
                dest: 'deploy/js/<%= pkg.name %>.js'
            }
        },
        sass: {
          deploy: {
            files: {
              "deploy/css/<%= pkg.name %>.css": "src/scss/<%= pkg.name %>.scss"
            }
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
            tasks: ['jshint', 'copy', 'concat', 'sass']
        }
    });

    grunt.registerTask('default', ['jshint', 'copy', 'concat', 'sass']);
    grunt.registerTask('develop', ['jshint', 'copy', 'concat', 'sass', 'connect', 'open', 'watch']);

}