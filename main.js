let data;
let page = 0;
const width = window.innerWidth * 0.8;
const height = window.innerHeight * 0.7;
const marginTop = 50;
const marginRight = 80;
const marginBottom = 80;
const marginLeft = 80;

// Load and transform data
d3.csv('./Vic_Road_Crash_Data.csv')
  .then(csv => {
    data = csv;
  })
  .catch(error => {
      console.log(`Error loading data: ${error}`);
      alert('Error loading data, please refresh the page');
  });

// Go to next scene
function next() {
  if (page === 0) {
    page++;
    d3.select('#start-button').text('Next');
    d3.select('#prev-button').style('display', 'inline-block');
    d3.select('#circle-container').style('display', 'flex');
    displaySceneOne();
  } else if (page === 1) {
    page++;
    d3.select('#circle-1').style('background-color', 'white');
    d3.select('#circle-2').style('background-color', '#008CBA');
    displaySceneTwo();
  } else if (page === 2) {
    page++;
    d3.select('#circle-2').style('background-color', 'white');
    d3.select('#circle-3').style('background-color', '#008CBA');
    d3.select('#dropdown').style('display', 'block');
    displaySceneThree();
  } // else we've already reached the end
}

// Go to prevous scene
function prev() {
  if (page === 3) {
    page--;
    d3.select('#circle-3').style('background-color', 'white');
    d3.select('#circle-2').style('background-color', '#008CBA');
    d3.select('#dropdown').style('display', 'none');
    displaySceneTwo();
  } else if (page === 2) {
    page--;
    d3.select('#circle-2').style('background-color', 'white');
    d3.select('#circle-1').style('background-color', '#008CBA');
    displaySceneOne();
  } // else we can't go back any further
}

/* Freeform user exploration */
function displaySceneThree(choice) {
  d3.select('#chart').html('');
  // Count frequencies by user's choice
  const parseDate = d3.timeParse("%d/%m/%Y");
  const formatDate = d3.timeFormat("%Y");

  // Calculate frequencies
  let frequencies;
  if (choice === 'ACCIDENT_DATE') {
    frequencies = d3.rollup(data, v => v.length, d => formatDate(parseDate(d[choice])));
  } else {
    frequencies = d3.rollup(data, v => v.length, d => ['collision with some other object', 'Fall from or in moving vehicle', 'Struck animal'].includes(d[choice]) ? 'Other accident' : d[choice]);
  }
  const finalData = Array.from(frequencies, ([choice, frequency]) => ({choice, frequency}));

  // Sort data
  if (choice === 'ACCIDENT_DATE' || choice === 'LIGHT_CONDITION') {
    finalData.sort((a, b) => d3.ascending(a.choice, b.choice));
  } else {
    finalData.sort((a, b) => d3.descending(a.frequency, b.frequency));
  }
  console.log(finalData);

  // X scale
  const x = d3.scaleBand()
    .domain(finalData.map(d => d.choice))
    .range([marginLeft, width - marginRight])
    .padding(0.1);

  // Y scale
  const y = d3.scaleLinear()
    .domain([0, d3.max(finalData, d => d.frequency)])
    .nice()
    .range([height - marginBottom, marginTop]);

  // Create SVG container
  const svg = d3.select('#chart')
    .append('svg')
    .attr('width', width)
    .attr('height', height);
  
  // Create bars
  if (choice) {
    svg.selectAll('.bar')
      .data(finalData)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr("fill", "steelblue")
      .attr('x', d => x(d.choice))
      .attr('width', x.bandwidth())
      .attr('y', height - marginBottom)
      .transition().duration(1000)
      .attr('y', d => y(d.frequency))
      .attr('height', d => height - marginBottom - y(d.frequency))
  }

  // Add X axis
  svg.append('g')
    .attr('transform', `translate(0,${height - marginBottom})`)
    .call(d3.axisBottom(x).tickSize(0))
    .selectAll('text')
    .attr('class', 'axis-label') 

  // Add Y axis
  svg.append('g')
    .attr('transform', `translate(${marginLeft},0)`)
    .call(d3.axisLeft(y))
    .selectAll('text')
    .attr('class', 'axis-label')

  // Add X axis label
  let xLabel;
  switch (choice) {
    case 'ACCIDENT_DATE':
      xLabel = 'Year';
      break;
    case 'LIGHT_CONDITION':
      xLabel = 'Light Condition (1 = low, 9 = high)';
      break;
    case 'ACCIDENT_TYPE_DESC':
      xLabel = 'Accident Type';
      break;
    case 'ROAD_GEOMETRY_DESC':
      xLabel = 'Road Geometry';
      break;
    case 'RMA':
      xLabel = 'Road Type';
      break;
  }
  svg.append('text')
  .attr('transform', `translate(${width / 2},${height - marginBottom + 40})`)
  .style('text-anchor', 'middle')
  .attr('class', 'axis-label')
  .text(xLabel)

  // Add Y axis label
  svg.append('text')
  .attr('transform', 'rotate(-90)')
  .attr('x', -height / 2)
  .attr('y', marginLeft - 60)
  .style('text-anchor', 'middle')
  .attr('class', 'axis-label')
  .text('Number of Crashes');
}


/* Histogram by day of week */
function displaySceneTwo() {
  d3.select('#chart').html('');
  // Count frequencies by day of week
  const dayOfWeekFreq = d3.rollup(data, v => v.length, d => d.DAY_OF_WEEK)
  const finalData = Array.from(dayOfWeekFreq, ([dayOfWeek, frequency]) => ({dayOfWeek, frequency}));
  finalData.sort((a, b) => d3.ascending(a.dayOfWeek, b.dayOfWeek));
  finalData.forEach(row => {
    switch (row.dayOfWeek) {
      case '0':
      case '1': row.dayOfWeek = 'Sun'; break;
      case '2': row.dayOfWeek = 'Mon'; break;
      case '3': row.dayOfWeek = 'Tue'; break;
      case '4': row.dayOfWeek = 'Wed'; break;
      case '5': row.dayOfWeek = 'Thu'; break;
      case '6': row.dayOfWeek = 'Fri'; break;
      case '7': row.dayOfWeek = 'Sat'; break;
    }
  })

  // X scale
  const x = d3.scaleBand()
    .domain(finalData.map(d => d.dayOfWeek))
    .range([marginLeft, width - marginRight])
    .padding(0.1);

  // Y scale
  const y = d3.scaleLinear()
    .domain([0, d3.max(finalData, d => d.frequency)])
    .nice()
    .range([height - marginBottom, marginTop]);

  // Create SVG container
  const svg = d3.select('#chart')
    .append('svg')
    .attr('width', width)
    .attr('height', height);
  
  // Create bars
  svg.selectAll('.bar')
    .data(finalData)
    .enter()
    .append('rect')
    .attr('class', 'bar')
    .attr("fill", "steelblue")
    .attr('x', d => x(d.dayOfWeek))
    .attr('width', x.bandwidth())
    .attr('y', height - marginBottom)
    // .transition().delay(200)
    .transition().delay((d, i) => 50 * i).duration(1000)
    .attr('y', d => y(d.frequency))
    .attr('height', d => height - marginBottom - y(d.frequency))
    .end().then(() => {
      // Highlight peak bars
      svg.selectAll('.bar')
        .filter(d => d.dayOfWeek == 'Sat')
        .transition()
        .duration(1000)
        .attr("fill", "#CBC3E3");

      // Show annotations
      svg.append("g")
        .attr("class", "annotation-group")
        .style("opacity", 0)
        .call(showSafeSaturday)
        .transition().duration(1000)
        .style("opacity", 1);
  });

const showSafeSaturday = d3.annotation()
  .editMode(false)
  .notePadding(15)
  .type(d3.annotationLabel)
  .accessors({
    x: d => x(d.dayOfWeek) + x.bandwidth()/2,
    y: d => y(d.frequency)
  })
  .annotations(safeSaturday)
  
  // Add X axis
  svg.append('g')
    .attr('transform', `translate(0,${height - marginBottom})`)
    .call(d3.axisBottom(x).tickSize(0))
    .selectAll('text')
    .attr('class', 'axis-label') 

  // Add Y axis
  svg.append('g')
    .attr('transform', `translate(${marginLeft},0)`)
    .call(d3.axisLeft(y))
    .selectAll('text')
    .attr('class', 'axis-label')

  // Add X axis label
  svg.append('text')
  .attr('transform', `translate(${width / 2},${height - marginBottom + 40})`)
  .style('text-anchor', 'middle')
  .attr('class', 'axis-label')
  .text('Day of Week');

  // Add Y axis label
  svg.append('text')
  .attr('transform', 'rotate(-90)')
  .attr('x', -height / 2)
  .attr('y', marginLeft - 60)
  .style('text-anchor', 'middle')
  .attr('class', 'axis-label')
  .text('Number of Crashes');
}

  
/* Histogram by hour of day */
function displaySceneOne() {
  d3.select('#chart').html('');
  // Count frequencies by hour
  const hrsFreq = d3.rollup(data, v => v.length, d => +d.ACCIDENT_TIME.slice(0,2))
  const finalData = Array.from(hrsFreq, ([hour, frequency]) => ({hour, frequency}));
  finalData.sort((a, b) => d3.ascending(a.hour, b.hour));

  // X scale
  const x = d3.scaleBand()
    .domain(finalData.map(d => d.hour))
    .range([marginLeft, width - marginRight])
    .padding(0.1);

  // Y scale
  const y = d3.scaleLinear()
    .domain([0, d3.max(finalData, d => d.frequency)])
    .nice()
    .range([height - marginBottom, marginTop]);

  // Create SVG container
  const svg = d3.select('#chart')
    .append('svg')
    .attr('width', width)
    .attr('height', height);
  
  // Create bars
  svg.selectAll('.bar')
    .data(finalData)
    .enter()
    .append('rect')
    .attr('class', 'bar')
    .attr("fill", "steelblue")
    .attr('x', d => x(d.hour))
    .attr('width', x.bandwidth())
    .attr('y', height - marginBottom)
    // .transition().delay(200)
    .transition().delay((d, i) => 50 * i).duration(1000)
    .attr('y', d => y(d.frequency))
    .attr('height', d => height - marginBottom - y(d.frequency))
    .end().then(() => {
      // Highlight peak bars
      svg.selectAll('.bar')
        .filter(d => [8, 15, 16, 17, 18].includes(d.hour))
        .transition()
        .duration(1000)
        .attr("fill", "orange");

      // Show annotations
      svg.append("g")
        .attr("class", "annotation-group")
        .style("opacity", 0)
        .call(showMorningRush)
        .transition().delay(1000).duration(1000)
        .style("opacity", 1);

      svg.append("g")
        .attr("class", "annotation-group")
        .style("opacity", 0)
        .call(showAfternoonRush)
        .transition().delay(1000).duration(1000)
        .style("opacity", 1);
  });

  const showMorningRush = d3.annotation()
    .editMode(false)
    .notePadding(15)
    .type(d3.annotationLabel)
    .accessors({
      x: d => x(d.hour),
      y: d => y(d.frequency)
    })
    .annotations(morningRush)

  const showAfternoonRush = d3.annotation()
    .editMode(false)
    .type(d3.annotationLabel)
    .accessors({
      x: d => x(d.hour),
      y: d => y(d.frequency)
    })
    .annotations(afternoonRush)
  
  // Add X axis
  svg.append('g')
    .attr('transform', `translate(0,${height - marginBottom})`)
    .call(d3.axisBottom(x).tickSize(0))
    .selectAll('text')
    .attr('class', 'axis-label') 

  // Add Y axis
  svg.append('g')
    .attr('transform', `translate(${marginLeft},0)`)
    .call(d3.axisLeft(y))
    .selectAll('text')
    .attr('class', 'axis-label')

  // Add X axis label
  svg.append('text')
  .attr('transform', `translate(${width / 2},${height - marginBottom + 40})`)
  .style('text-anchor', 'middle')
  .attr('class', 'axis-label')
  .text('Hour of Day');

  // Add Y axis label
  svg.append('text')
  .attr('transform', 'rotate(-90)')
  .attr('x', -height / 2)
  .attr('y', marginLeft - 60)
  .style('text-anchor', 'middle')
  .attr('class', 'axis-label')
  .text('Number of Crashes');
}


// Annotations
const morningRush = [{
  note: {
    title: "Morning Rush",
    label: "I'm late to work!",
  },
  data: { hour: 8, frequency: 9500 },
  className: "show-bg",
  dy: 40,
  dx: -110
}]

const afternoonRush = [{
  note: {
    label: "Work is done, I don't care what happens to me anymore",
    title: "Afternoon Rush",
    wrap: 150,
  },
  data: { hour: 18, frequency: 12000 },
  className: "show-bg",
  dy: 20,
  dx: 150,
}]

const safeSaturday = [{
  note: {
    title: "Saturdays are the safest day",
  },
  data: { dayOfWeek: 'Sat', frequency: 19300 },
  className: "show-bg",
  dy: 0,
  dx: 0,
}]