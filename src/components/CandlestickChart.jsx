import { useState, useEffect } from 'react'
import Papa from 'papaparse'
import Chart from 'react-apexcharts';
import './style.css'

const CandlestickChart = () => {
  const [data, setData] = useState([]);
  const [minDate, setMinDate] = useState('');
  const [maxDate, setMaxDate] = useState('');

  useEffect(() => {
    fetch('/VFS_historical_data_StockScan.csv')
      .then(response => response.text())
      .then(text => {
        Papa.parse(text, {
          header: true,
          dynamicTyping: true,
          complete: (results) => {
            const parsedData = results.data.map(row => ({
              date: row.Date,
              open: row.Open,
              high: row.High,
              low: row.Low,
              close: row.Close,
            }));
            setData(parsedData);
          }
        });
      });
  }, []);
  
  useEffect(() => {
    if (data.length > 0) {
      const dates = [...data].map(d => new Date(d?.date));
      const minDate = dates[dates.length - 2].toISOString().split('T')[0];
      const maxDate = dates[0].toISOString().split('T')[0];
      setMinDate(minDate);
      setMaxDate(maxDate);
    }
  }, [data]);

  const filteredData = data.filter(d => {
    const date = new Date(d.date);
    const min = minDate ? new Date(minDate) : null;
    const max = maxDate ? new Date(maxDate) : null;
    return (!min || date >= min) && (!max || date <= max);
  });

  const series = [
    {
      name: 'Candlestick',
      type: 'candlestick',
      data: filteredData.map(data => ({
        x: new Date(data.date),
        y: [data.open, data.high, data.low, data.close]
      }))
    },
  ];

  const options = {
    chart: {
      type: 'candlestick',
      height: 350,
      background: '#333', 
      foreColor: '#fff',
      toolbar: {
        show: false
      }  
    },
    title: {
      align: 'left',
      style: {
        color: '#fff'
      }
    },
    xaxis: {
      type: 'datetime',
      tickAmount: 6,
      labels: {
        formatter: function(value) {
          const date = new Date(value);
          return date.toISOString().split('T')[0];
        },
        style: {
          colors: '#fff',
        }
      },
      axisBorder: {
        color: '#777' 
      },
      axisTicks: {
        color: '#777'  
      },
    },
    yaxis: [
      {
        opposite: true,
        labels: {
            formatter: function(value) {
                return `$${value.toFixed(2)}`;
              },
            style: {
              colors: '#fff'
            }
          },
          axisBorder: {
            color: '#777'  
          },
          axisTicks: {
            color: '#777' 
          }

      },
    ],
    grid: {
        borderColor: '#444' 
    },
    tooltip: {
      theme: 'dark',
      shared: true,
      custom: function({ seriesIndex, dataPointIndex, w }) {
        const o = w.globals.seriesCandleO[seriesIndex][dataPointIndex];
        const h = w.globals.seriesCandleH[seriesIndex][dataPointIndex];
        const l = w.globals.seriesCandleL[seriesIndex][dataPointIndex];
        const c = w.globals.seriesCandleC[seriesIndex][dataPointIndex];
        return (
          `<div style="padding: 10px;">` +
          `<div><strong>Open:</strong> ${o}</div>` +
          `<div><strong>High:</strong> ${h}</div>` +
          `<div><strong>Low:</strong> ${l}</div>` +
          `<div><strong>Close:</strong> ${c}</div>` +
          `</div>`
        );
      }
    }
  };

  return (
    <div>
      <div className='date'>
        <input 
          className='inputDate'
          type="date" 
          value={minDate} 
          onChange={(e) => setMinDate(e.target.value)} 
        />
        <input 
          className='inputDate'
          type="date" 
          value={maxDate} 
          onChange={(e) => setMaxDate(e.target.value)} 
        />
      </div>
      <Chart
        options={options}
        series={series}
        type="candlestick"
        height={350}
        width="800"
      />
    </div>
  )
}

export default CandlestickChart
