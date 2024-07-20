let data;

// Load and transform data
d3.csv('./Vic_Road_Crash_Data.csv')
  .then(csv => {
    console.log(csv[0])
    data = csv;
    // displaySceneOne();
  })
  .catch(error => {
      console.log(`Error loading data: ${error}`);
      alert('Error loading data, please refresh the page');
  });

const width = window.innerWidth * 0.8;
const height = window.innerHeight * 0.7;
const marginTop = 50;
const marginRight = 80;
const marginBottom = 80;
const marginLeft = 80;

function displaySceneOne() {
  // Calculate frequencies of each hour
  const hours = data.map(row => +row.ACCIDENT_TIME.slice(0,2));
  hrsFreq = {}
  hours.forEach(hr => {
    if (hrsFreq.hasOwnProperty(hr)) {
      hrsFreq[hr] += 1;
    } else {
      hrsFreq[hr] = 0;
    }
  })
  
  // Reformat data
  const finalData = [];
  for (const [hour, freq] of Object.entries(hrsFreq)) {
    finalData.push({
      'hour': hour,
      'frequency': freq,
    })
  }
  console.log(finalData);

  // X scale
  const x = d3.scaleBand()
    .domain(finalData.map(d => d.hour))
    .range([marginLeft, width - marginRight])
    .padding(0.1);

  const y = d3.scaleLinear()
    .domain([0, d3.max(finalData, d => d.frequency)])
    .nice()
    .range([height - marginBottom, marginTop]);

  // Create SVG container
  const svg = d3.select('#histogram-time')
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
    .attr('y', d => y(d.frequency))
    .attr('width', x.bandwidth())
    .attr('height', d => height - marginBottom - y(d.frequency));

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
