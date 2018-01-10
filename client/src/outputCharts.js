
  function clearCharts() {    
    var chartDiv = $('#chart')[0];

      while(chartDiv.firstChild) {
        chartDiv.removeChild(chartDiv.firstChild);
      }
  }


  /**
   * Main function involved in displaying charts
   * Creates both the charts and sliders
   */
  function generateCharts(costs) {
    for (var id in costs) {
      createCanvas(id);
      var ctx = $('#canvas-'+id)[0].getContext('2d');
      var initialCost = costs[id].cost.replace(/l/g, '*0');
      var f = convertCost(initialCost);
      var chart = createChart(id, f, ctx);
      createSlider(id, costs[id].cost, chart);
    }
  }

  function getChartData(x, f) {
    var chartData = [];
    for (var i = 0; i < x.length; i++) {
      chartData.push(f(x[i]));
    }
    return chartData;
  }

  function createChart(id, f, ctx) {

    xInput = [0,1,2,3,4,5];

    var chartData = getChartData(xInput, f);

    var data = {
      labels: xInput,
        datasets: [{
            label: 'performance',
            borderColor: "rgba(75, 192, 192, 1)",
            data: chartData,
            fill: false
        }]
    };
  
    return new Chart(ctx, {
      type: 'line',
      data: data,
      options: {
        scales: {
          xAxes: [{
            gridLines: {
              color: 'white'
            }
          }],
          yAxes: [{
            color: '#FFF',
            ticks: {
                beginAtZero:true
            }
          }]
        }
      }
    });
  }


  function createCanvas(id) {
    var canvas = document.createElement('canvas');
    canvas.class = 'chart';
    canvas.id = 'canvas-' + id;

    var chartDiv = document.getElementById('chart');
    chartDiv.appendChild(canvas);

  }

  function convertCost(cost) {
    var newCost = cost;
    for (var i = 1; i < cost.length; i++) {
      if (cost[i].match(/[a-z]/)) {
        if (!isNaN(parseInt(cost[i-1]))) {
          newCost = cost.slice(0, i) + '*'  + cost.slice(i, cost.length);
          cost = newCost;
        }
      }
    }
    return new Function('n', 'return ' + newCost);
  }


  function handleSliderInput(slider, chart) {
    slider.oninput = function() {
      var slider = document.getElementById('slider'+this.uuid);

      var cost = slider.cost;

      cost = cost.replace(/l/g, '*' + this.value);
      var f = convertCost(cost);

      var x = chart.data.labels;
      chartData = getChartData(x, f)

      chart.chart.data.datasets[0].data = chartData;

      chart.update();
    }
  }

  function createSlider(id, cost, chart) {

    var sliderDiv = document.createElement('div');
    sliderDiv.class = 'slidercontainer';
    sliderDiv.id = 'slidercontainer' + id;

    var slider = document.createElement('input');
    slider.id = 'slider'+id;
    slider.class = 'slider';
    slider.type = 'range';
    slider.min = '0';
    slider.max = '128';
    slider.value = '0';
    slider.uuid = id;
    slider.cost = cost;

    sliderDiv.appendChild(slider);

    var chartDiv = document.getElementById('chart');
    chartDiv.appendChild(slider);

    handleSliderInput(slider, chart);
  }