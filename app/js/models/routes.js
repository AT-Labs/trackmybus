(function() {
    'use strict';

    angular.module('metro.models').factory('Routes', Routes);

    Routes.$inject = ['Database'];

    function Routes(Database) {

        function processRoutes(routes) {
            return _.reduce(routes, function(result, route) {
                var isDuplicate = _.some(result, function(existingRoute) {
                    return existingRoute.code === route.route_short_name;
                });

                if (!isDuplicate) {
                    var data = {
                        id: route.route_id,
                        code: route.route_short_name,
                        shortname: route.route_long_name
                    };
                    var index = data.shortname.toLowerCase().indexOf(' to ');
                    if (index > 0) {
                        data.shortname = data.shortname.slice(index + 4);
                    }

                    return result.concat(data);
                } else {
                    return result;
                }
            }, []);
        }
        
        function clear() {
            Database.collections.routes.clear();
        }
        
        function getRoutes(stopId) {
            var data = Database.collections.routes.findOne({ 'stop': stopId });
            if(data && _.isArray(data.routes)) {
                return data.routes;
            }
        }
        
        function saveRoutes(stopId, routes) {
            var savedRoutes = getRoutes(stopId);
            var processedRoutes = processRoutes(routes);
            
            if(savedRoutes) {
                savedRoutes.routes = processedRoutes;
                Database.collections.routes.update(savedRoutes);
            } else {
                Database.collections.routes.insert({
                    stop: stopId,
                    routes: _.clone(processedRoutes)
                });
            }
            
            return processedRoutes;
        }

        return {
            clear: clear,
            getRoutes: getRoutes,
            saveRoutes: saveRoutes
        };
    }

})();