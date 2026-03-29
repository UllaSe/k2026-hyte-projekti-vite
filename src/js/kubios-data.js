import { fetchData } from './fetch';

// 1. hae data
// 2. muotoile data
// 3. anna muotoiltu data graafikirjastolle

// Function to test and get user info from kubios API
const getUserInfo = async () => {
  console.log('Käyttäjän INFO Kubioksesta');

  const url = 'http://localhost:3000/api/kubios/user-info';
  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };
  const options = {
    headers: headers,
  };
  const userData = await fetchData(url, options);

  if (userData.error) {
    console.log('Käyttäjän tietojen haku Kubioksesta epäonnistui');
    return;
  }
  console.log(userData);
};

// Function to get more actual data from Kubios API
const getUserData = async () => {
  console.log('Käyttäjän DATA Kubioksesta');

  const url = 'http://localhost:3000/api/kubios/user-data';
  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };
  const options = {
    headers: headers,
  };
  const userData = await fetchData(url, options);

  if (userData.error) {
    console.log('Käyttäjän tietojen haku Kubioksesta epäonnistui');
    return;
  }
  console.log(userData);
  let formattedData = formatKubiosResults(userData);
  console.log('Formatoitu data', formattedData);

  // Draw chart with chart.js
  drawChart(formattedData);
  // Draw chart with amcharts
  drawAMChart(formattedData);
};

// https://www.w3schools.com/jsref/jsref_map.asp

// You need to formulate data into correct structure in the BE
// OR you can extract the data here in FE from one or multiple sources
// Extract data: https://www.w3schools.com/jsref/jsref_map.asp

const formatKubiosResults = (userData) => {
  // tähän linkki mistä saa päivämäärän formatoinnin
  const formatter = new Intl.DateTimeFormat('fi-FI', {
    day: 'numeric',
    month: 'long',
  });

  const formattedData = userData.results.map((entry) => {
    // Muunnetaan päivämäärä Date-olioksi
    const dateObject = new Date(entry.daily_result);
    // Muotoillaan label (esim "19. elokuuta") chart.js varten
    const formattedLabel = formatter.format(dateObject);
    // Timestamp amCharts varten, muuttaa päivämäärän numeroksi
    const timestamp = dateObject.getTime();

    // Haetaan arvot
    const readinessValue = entry.result.readiness;
    const stressValue = entry.result.stress_index;

    // palautetaan muotoiltu objekti jossa arvot
    return {
      date: entry.daily_result, // alkuperäinen päivämäärä
      timestamp: timestamp, // amCharts
      label: formattedLabel, // Chart.js label päivämäärä
      readiness: entry.result.readiness,
      stressIndex: entry.result.stress_index,
    };
  });

  return formattedData;
};

const numbers = [1, 2, 3];

const doubled = numbers.map((n) => {
  return n * 2;
});

const data = numbers.map((n) => ({
  value: n,
}));

console.log(doubled, data);

// const formatKubiosResults = (userData) => {
//   return userData.results.map((entry) => ({
//     date: entry.daily_result,
//     timestamp: new Date(entry.daily_result).getTime(),
//     label: new Intl.DateTimeFormat('fi-FI', {
//       day: 'numeric',
//       month: 'long',
//     }).format(new Date(entry.daily_result)),
//     readiness: entry.result.readiness,
//     stressIndex: entry.result.stress_index,
//   }));
// };

// Let us try these together
const drawChart = (formattedData) => {
  // Create the chart
  // https://www.chartjs.org/docs/latest/charts/line.html
  // https://www.chartjs.org/docs/latest/samples/line/line.html

  // Add necessary adapters
  // https://github.com/chartjs/awesome#adapters

  // Muodostetaan erilliset taulukot Chart.js:ää varten
  const labels = formattedData.map((item) => item.label);
  const readinessValues = formattedData.map((item) => item.readiness);
  const stressValues = formattedData.map((item) => item.stressIndex);

  console.log('Labels:', labels);
  console.log('Readiness:', readinessValues);
  console.log('Stress:', stressValues);

  const ctx = document.getElementById('jsChart');

  new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Readiness',
          data: readinessValues,
          borderWidth: 1,
          borderColor: 'blue',
        },
        {
          label: 'Stress Index',
          data: stressValues,
          borderWidth: 1,
          borderColor: 'red',
        },
      ],
    },
    options: {
      responsive: true,
      locale: 'fi-FI',
      scales: {
        x: {
          title: {
            display: true,
            text: 'Päivämäärä',
          },
        },
        y: {
          title: {
            display: true,
            text: 'Readiness / Stress',
          },
        },
      },
    },
  });
};

const drawAMChart = (formattedData) => {
  // Lets look at a example from
  // https://www.amcharts.com/demos/line-graph/

  // Documentation
  // https://www.amcharts.com/docs/v5/getting-started/

  am5.ready(function () {
    // Create root element
    // https://www.amcharts.com/docs/v5/getting-started/#Root_element
    var root = am5.Root.new('chartdiv');

    // Set themes
    // https://www.amcharts.com/docs/v5/concepts/themes/
    root.setThemes([am5themes_Animated.new(root)]);

    // Create chart
    // https://www.amcharts.com/docs/v5/charts/xy-chart/
    var chart = root.container.children.push(
      am5xy.XYChart.new(root, {
        panX: true,
        panY: true,
        wheelX: 'panX',
        wheelY: 'zoomX',
        pinchZoomX: true,
        paddingLeft: 0,
      })
    );

    // Add cursor
    // https://www.amcharts.com/docs/v5/charts/xy-chart/cursor/
    var cursor = chart.set(
      'cursor',
      am5xy.XYCursor.new(root, {
        behavior: 'none',
      })
    );
    cursor.lineY.set('visible', false);

    // Create axes
    // https://www.amcharts.com/docs/v5/charts/xy-chart/axes/
    var xAxis = chart.xAxes.push(
      am5xy.DateAxis.new(root, {
        maxDeviation: 0.2,
        baseInterval: {
          timeUnit: 'day',
          count: 1,
        },
        renderer: am5xy.AxisRendererX.new(root, {
          minorGridEnabled: true,
        }),
        tooltip: am5.Tooltip.new(root, {}),
      })
    );

    var yAxis = chart.yAxes.push(
      am5xy.ValueAxis.new(root, {
        renderer: am5xy.AxisRendererY.new(root, {
          pan: 'zoom',
        }),
      })
    );

    // Add series
    // https://www.amcharts.com/docs/v5/charts/xy-chart/series/
    var readinesSeries = chart.series.push(
      am5xy.LineSeries.new(root, {
        name: 'Readiness',
        xAxis: xAxis,
        yAxis: yAxis,
        valueYField: 'readiness',
        valueXField: 'date',
        tooltip: am5.Tooltip.new(root, {
          labelText: '{valueY}',
        }),
      })
    );

    var stressSeries = chart.series.push(
      am5xy.LineSeries.new(root, {
        name: 'Stress',
        xAxis: xAxis,
        yAxis: yAxis,
        valueYField: 'stress_index',
        valueXField: 'date',
        stroke: am5.color(0xff6384), // Red color
        tooltip: am5.Tooltip.new(root, {
          labelText: '{valueY}',
        }),
      })
    );

    // Add scrollbar
    // https://www.amcharts.com/docs/v5/charts/xy-chart/scrollbars/
    chart.set(
      'scrollbarX',
      am5.Scrollbar.new(root, {
        orientation: 'horizontal',
      })
    );

    // “Kun käytämme amChartsin DateAxis-akselia, x-akselin arvon pitää olla numero – eli timestamp millisekunteina.”
    // 1692403200000

    // “Chart.js voi käyttää pelkkiä label-tekstejä, mutta amCharts toimii oikean ajan kanssa.”

    // Chart.js piirtää listan, amCharts piirtää ajan.

    // Set data
    console.log(formattedData);

    const data = formattedData.map((entry) => ({
      date: entry.timestamp,
      readiness: entry.readiness,
      stress_index: entry.stressIndex,
    }));

    readinesSeries.data.setAll(data);
    stressSeries.data.setAll(data);

    // Make stuff animate on load
    // https://www.amcharts.com/docs/v5/concepts/animations/
    readinesSeries.appear(1000);
    stressSeries.appear(1000);
    chart.appear(1000, 100);
  }); // end am5.ready()
};

export { getUserData, getUserInfo };
