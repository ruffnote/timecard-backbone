module.exports = function(grunt){
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    coffee: {
      compile: {
        files: {
          'lib/timecard-backbone.js': [
            'app/models/*.coffee', 
            'app/controllers/*.coffee', 
            'app/views/*.coffee', 
            'app/*.coffee'
          ],
        }
      },
    },
    concat: {
      dist: {
        files: {
          "public/js/timecard-backbone.js": [
            "lib/underscore.js",
            "lib/jquery.js",
            "lib/*"
          ]
        }
      }
    },
    cssmin: {
      combine: {
        files: {
          'public/css/timecard-backbone.css': [
            'app/stylesheets/*css'
          ],
        }
      }
    },
    watch: {
      doc: {
        files: ['app/*.coffee'],
        tasks: 'coffee'
      }
    }
  });
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-coffee');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.registerTask('default', ['coffee', 'concat', 'cssmin']); 
}
