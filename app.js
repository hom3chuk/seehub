/**
 * Created by hom3chuk on 23.02.16.
 */

'use strict';

var app = angular.module('seehub', []);

app.controller('mainController', function($scope, $http){
    $scope.username = 'hom3chuk';
    $scope.buddies = [];
    $scope.load = function(){
        $scope.status = 'loading';
        $http.get('https://api.github.com/users/'+$scope.username)
            .then(function(res){
                $scope.result = res.data;
                $scope.data = [{
                    axes: [
                        {axis: "Repos", value: res.data.public_repos},
                        {axis: "Gists", value: res.data.public_gists},
                        {axis: "Age", value: new Date().getFullYear() - new Date(res.data.created_at).getFullYear()}
                        //{axis: "Followers", value: res.data.followers},
                        //{axis: "Following", value: res.data.following}
                    ]
                }];
                console.log(res.data.followers_url);
                $scope.loadBuddies(res.data.followers_url.replace(/(\{.*\})/gi, ''));
            })
            .catch(function(res){
                console.error('Failed to load');
            }).then(function(res){
                $scope.status = '';
                $scope.star();
            });
    };

    $scope.loadBuddies = function(url){
        $http.get(url).then(function(res){
            return Promise.all(
                res.data.map(function(buddy){
                    return $http.get(buddy.url);
                })
            );
        })
            .then(function(buddies){
                buddies.forEach(function(buddy){
                    $scope.data.push({
                       axes: [
                           {axis: "Repos", value: buddy.data.public_repos},
                           {axis: "Gists", value: buddy.data.public_gists},
                           {axis: "Age", value: new Date().getFullYear() - new Date(buddy.data.created_at).getFullYear()}
                           //{axis: "Followers", value: buddy.data.followers},
                           //{axis: "Following", value: buddy.data.following}
                       ]
                    });
                });
                $scope.star();
            });
    };

    $scope.star = function(){
        RadarChart.draw(".chart-container", $scope.data);
    };
});