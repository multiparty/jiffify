

  document.getElementById("defaultOpen").click();
  document.getElementById("inputOpen").click();

  function openTab(evt, tabName) {
    var i, tabcontent, tablinks;

    tabcontent = document.getElementsByClassName("tabcontent");
    if (tabName != "input") {
    for (i = 0; i < tabcontent.length; i++) {
      if (tabcontent[i].id !== 'input') {
        tabcontent[i].style.display = "none";
      }
    }

    // Get all elements with class="tablinks" and remove the class "active"
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        if (tablinks[i].id !== 'inputOpen') {
          tablinks[i].className = tablinks[i].className.replace(" active", "");
        }
    }
  }
    // Show the current tab, and add an "active" class to the button that opened the tab
    document.getElementById(tabName).style.display = "flex";
    evt.currentTarget.className += " active";

}

  var inputEditor = CodeMirror.fromTextArea(document.getElementById("codeInput"), {
    lineNumbers: true,
    styleActiveLine: true,
    matchBrackets: true,
  });

  var outputEditor = CodeMirror.fromTextArea(document.getElementById("codeOutput"), {
    lineNumbers: true,
    styleActiveLine: true,
    matchBrackets: true,
  });


  // var costEditor = CodeMirror.fromTextArea(document.getElementById("costOutput"), {
  //   lineNumbers: true,
  //   styleActiveLine: true,
  //   matchBrackets: true,
  // });


  const THEME = "isotope";
  inputEditor.setOption("theme", THEME);
  outputEditor.setOption("theme", THEME);
  // costEditor.setOption("theme", THEME);

  function stringifyCosts(costs) {
    var allCosts = "";
    for (k in costs) {
      allCosts += k + ": " + costs[k] + "\n";
    }
    return allCosts;
  }

  var LINE_CLASS = "CodeMirror-activeline-background";

  function highlightErrors(inputEditor, lines) {
    for (var i = 0; i < lines.length; i++) {
      inputEditor.addLineClass(lines[i].start - 1, 'background', LINE_CLASS);
    }
  }
  
  function handleErrors(errors) {
    var errorStr = '';
    var lines = [];
    for (var i = 0; i < errors.length; i++) {
      var start, end;
      try {
        start = errors[i].location.start.line;
        end = errors[i].location.end.line;

      } catch (e) {
        start = '';
        end = '';
      }
      errorStr += 'Error: ' + errors[i].text + ', line: ' + start + '\n';
      lines.push({start: start, end: end});
    }
    return {errorStr: errorStr, lines: lines};
  }

  function formatCosts(costs) {
    var costStr = '';
    for (var id in costs) {
      costStr += costs[id].name + ': ' + costs[id].cost + '\n';
    }
    return costStr;
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

  function clearCharts() {    
    var chartDiv = $('#chart')[0];

      while(chartDiv.firstChild) {
        chartDiv.removeChild(chartDiv.firstChild);
      }
  }

  $(document).ready(function() {
    document.getElementById("defaultOpen").click();

    $('#submitBtn').click(function (){
      var code = $('#codeInput').val();
      var text = inputEditor.getValue();

      $.ajax({
        type: "POST",
        url: '/postCode',
        data: {code: text},
        success: function(data){
          data = JSON.parse(data);

          if (data.errors.length > 0) {
        
            var errorObj = handleErrors(data.errors);
            outputEditor.setValue(errorObj.errorStr);
          
            highlightErrors(inputEditor, errorObj.lines);

          } else {
            outputEditor.setValue(data.code);
            clearCharts(); 
            generateCharts(data.costs);
          }
        },
        dataType: 'text'
      });
    });
  });