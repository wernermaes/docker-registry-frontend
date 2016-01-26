'use strict';

/**
 * @ngdoc function
 * @name docker-registry-frontend.controller:TagController
 * @description
 * # TagController
 * Controller of the docker-registry-frontend
 */
angular.module('tag-controller', ['registry-services'])
  .controller('TagController', ['$scope', '$route', '$routeParams', '$location', '$log', '$filter', 'Manifest', 'Tag', 'filterFilter', '$modal',
  function($scope, $route, $routeParams, $location, $log, $filter, Manifest, Tag, filterFilter, $modal){

    $scope.$route = $route;
    $scope.$location = $location;
    $scope.$routeParams = $routeParams;

    $scope.searchName = $route.current.params.searchName;
    $scope.repositoryUser = $route.current.params.repositoryUser;
    $scope.repositoryName = $route.current.params.repositoryName;
    $scope.repository = $scope.repositoryUser + '/' + $scope.repositoryName;
    $scope.tagName = $route.current.params.tagName;
    
     // How to query the tags
    $scope.tags = Tag.query({
      repoUser: $scope.repositoryUser,
      repoName: $scope.repositoryName
    }, function(result){
      for (var idx in result){
        if ( result[idx].hasOwnProperty('name') ) {
            result[idx].details = Manifest.query({repoUser: $scope.repositoryUser, repoName: $scope.repositoryName, tagName: result[idx].name});
        }
      } 
    });

    // Copy collection for rendering in a smart-table
    $scope.displayedTags = [].concat($scope.tags);

    // selected tags
    $scope.selection = [];

    // helper method to get selected tags
    $scope.selectedTags = function selectedTags() {
      return filterFilter($scope.displayedTags, { selected: true });
    };

    // watch fruits for changes
    $scope.$watch('tags|filter:{selected:true}', function(nv) {
      $scope.selection = nv.map(function (tag) {
        return $scope.repository + ':' + tag.name;
      });
    }, true);

    $scope.openConfirmTagDeletionDialog = function(size) {
      var modalInstance = $modal.open({
          animation: true,
          templateUrl: 'modalConfirmDeleteItems.html',
          controller: 'DeleteTagsController',
          size: size,
          resolve: {
            items: function () {
              return $scope.selection;
            },
            information: function() {
              return 'A tag is basically a reference to an image. \
                      If no references to an image exist, the image will be \
                      scheduled for automatic deletion. \
                      That said, if you remove a tag, you remove a reference to an image. \
                      Your image data may get lost, if no other tag references it. \
                      Are you sure, you want to delete the following tags?';
            }
          }
      });
    };

  }]);