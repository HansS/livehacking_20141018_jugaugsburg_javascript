angular.module('tinkerforge', ['ui.bootstrap', 'tc.chartjs'])
.controller('MainCtlr', ['$scope', 'AmbientService', function ($scope, AmbientService) {
        "use strict";
        var MAX_DIAGRAMM_VALUES = 40;
        $scope.ambientUid = 'mgd',
        $scope.touchUid = 'jUY',
        $scope.host = 'localhost',
        $scope.port = "4280";
        
        $scope.maxLux = "200.0";
        $scope.touch = {};
        $scope.touch.nr = "";
        $scope.running = false;

        function callbackTouch(nr) {
            $scope.touch.nr = nr;
            if (nr === 0) {
                $scope.chartData.datasets[0].data.splice(0, $scope.chartData.datasets[0].data.length);
                $scope.chartData.labels.splice(0, $scope.chartData.labels.length);
            }
        }
        
        function callbackIlluminance(illuminance) {
            $scope.luxValue = illuminance / 10;
            if ($scope.chartData.labels.length > MAX_DIAGRAMM_VALUES) {
                $scope.chartData.datasets[0].data.shift();
                $scope.chartData.labels.shift();
            }
            $scope.chartData.datasets[0].data.push($scope.luxValue);
            $scope.chartData.labels.push("");
            $scope.$apply();
        };
        
        $scope.startAmbient = function() {
            AmbientService.startAmbient($scope.ambientUid,$scope.touchUid, $scope.host, $scope.port, callbackIlluminance,callbackTouch);
            $scope.running = true;
        };

 $scope.chartData = {
      labels: [],
      datasets: [
        {
          label: '',
          fillColor: 'rgba(220,220,220,0.2)',
          strokeColor: 'rgba(255,0,0,1)',
          pointColor: 'rgba(220,220,220,1)',
          pointStrokeColor: '#fff',
          pointHighlightFill: '#fff',
          pointHighlightStroke: 'rgba(220,220,220,1)',
          data: []
        }
      ]
    };

    // Chart.js Options
    $scope.chartOptions =  {

      scaleShowGridLines : true,
            scaleGridLineColor : "rgba(0,0,0,.05)",
      scaleGridLineWidth : 1,
      bezierCurve : true,
      bezierCurveTension : 0.4,
      pointDot : true,
      pointDotRadius : 4,
      pointDotStrokeWidth : 1,
      pointHitDetectionRadius : 20,
      datasetStroke : true,
      datasetStrokeWidth : 2,
      datasetFill : true,
      onAnimationProgress: function(){},
      onAnimationComplete: function(){},
      legendTemplate : '<ul class="tc-chart-js-legend"><% for (var i=0; i<datasets.length; i++){%><li><span style="background-color:<%=datasets[i].strokeColor%>"></span><%if(datasets[i].label){%><%=datasets[i].label%><%}%></li><%}%></ul>'
    };



}]).factory('AmbientService', ['$q', function ($q) {
    "use strict";

        function startAmbientFn(ambientUID, touchUid, HOST, PORT, callbackIlluminance,callbackTouch) {
            var ipcon = new Tinkerforge.IPConnection(),
                ambient = new Tinkerforge.BrickletAmbientLight(ambientUID, ipcon),
                multiTouch = new Tinkerforge.BrickletMultiTouch(touchUid, ipcon); // Create device object

            ipcon.connect(HOST, PORT,
                    function (error) {
                        console.log('Error: ' + error + '\n');
                    }
            ); // 
            ipcon.on(Tinkerforge.IPConnection.CALLBACK_CONNECTED,
                    function (connectReason) {
                        ambient.setIlluminanceCallbackPeriod(1000);
                    }
            );
    
            multiTouch.on(Tinkerforge.BrickletMultiTouch.CALLBACK_TOUCH_STATE,
                // Callback function for touch state
                function(touchState) {
                    var s = '';
                    if(touchState & (1 << 12)) {
                        console.log('In proximity');
                    }
                    if((touchState & 0xFFF) === 0) {
                        console.log('No electrodes touched');
                    }
                    else {
                        for(var i=0; i<12; i++) {
                            if(touchState & (1 << i)) {
                                callbackTouch(i);
                            }
                        }
                    }
                 }
            ); 
    
            ambient.on(Tinkerforge.BrickletAmbientLight.CALLBACK_ILLUMINANCE,   callbackIlluminance  );
        }

        return {
            startAmbient: startAmbientFn
        };
    }]);
