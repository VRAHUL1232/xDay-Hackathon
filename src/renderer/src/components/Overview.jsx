/* eslint-disable prettier/prettier */
/* eslint-disable react/prop-types */
/* eslint-disable prettier/prettier */
/* eslint-disable no-unused-vars */
import React, { useEffect, useRef, useState } from 'react'
import * as echarts from 'echarts'
import { TooltipComponent, LegendComponent } from 'echarts/components'
import { TitleComponent } from 'echarts/components'
import { FilesIcon } from 'lucide-react'
import { FaFilePdf, FaFileImage, FaFileAlt, FaFile } from 'react-icons/fa'
import { BarChart, LineChart } from 'echarts/charts'
import { LabelLayout } from 'echarts/features'
import { CanvasRenderer } from 'echarts/renderers'

// Register ECharts components
echarts.use([TooltipComponent, LegendComponent, BarChart, LineChart, CanvasRenderer, LabelLayout])
echarts.use([TitleComponent])

const EChartsDrilldownBarChart = ({ data }) => {
  // Reference to the chart container
  const chartRef = useRef(null)
  const [isDrilledDown, setIsDrilledDown] = useState(false)

  useEffect(() => {
    if (!chartRef.current) return

    // Initialize the chart
    const myChart = echarts.init(chartRef.current)

    // Root level data
    const rootData = [
      { name: 'Clean', value: 10, itemStyle: { color: 'green' } },
      { name: 'Infected', value: 6, itemStyle: { color: 'red' } }
    ]

    // Second level data
    const secondLevelData = {
      Clean: [
        { name: 'PDF', value: data.cleanPDF, itemStyle: { color: 'green' } },
        { name: 'Image', value: data.cleanImage, itemStyle: { color: 'green' } },
        { name: 'Doc', value: data.cleanDoc, itemStyle: { color: 'green' } },
        { name: 'Other', value: data.cleanOther, itemStyle: { color: 'green' } }
      ],
      Infected: [
        { name: 'PDF', value: data.infectedPDF, itemStyle: { color: 'red' } },
        { name: 'Image', value: data.infectedImage, itemStyle: { color: 'red' } },
        { name: 'Doc', value: data.infectedDoc, itemStyle: { color: 'red' } },
        { name: 'Other', value: data.infectedOther, itemStyle: { color: 'red' } }
      ]
    }

    // Chart configuration
    const option = {
      title: {
        text: 'File Status',
        left: 'center',
        textStyle: {
          fontSize: 15,
          fontWeight: 'bold',
          color: '#000000'
        }
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      toolbox: {
        show: true,
        orient: 'vertical', // Arrange toolbox items vertically
        left: 'right',
        top: 'center',
        feature: {
          restore: { show: true },
          saveAsImage: { show: true }
        }
      },
      xAxis: {
        type: 'category',
        data: rootData.map(item => item.name)
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          type: 'bar',
          data: rootData,
          label: {
            show: true,
            position: 'inside'
          }
        }
      ]
    }

    // Set the option
    myChart.setOption(option)

    // Drilldown event listener
    myChart.on('click', function (params) {
      if (params.componentType === 'series') {
        const name = params.name
        const drilldownData = secondLevelData[name]

        myChart.setOption({
          xAxis: {
            type: 'category',
            data: drilldownData.map(item => item.name)
          },
          series: [
            {
              name: name,
              type: 'bar',
              data: drilldownData,
              label: {
                show: true,
                position: 'inside'
              }
            }
          ]
        })

        setIsDrilledDown(true)
      }
    })

    // Cleanup on unmount
    return () => {
      myChart.dispose()
    }
  }, [data])

  const handleBackClick = () => {
    if (!chartRef.current) return

    const myChart = echarts.init(chartRef.current)

    // Root level data
    const rootData = [
      { name: 'Clean', value: 10, itemStyle: { color: 'green' } },
      { name: 'Infected', value: 6, itemStyle: { color: 'red' } }
    ]

    // Chart configuration for root level
    const option = {
      title: {
        text: 'File Status',
        left: 'center',
        textStyle: {
          fontSize: 15,
          fontWeight: 'bold',
          color: '#000000'
        }
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      toolbox: {
        show: true,
        orient: 'vertical', // Arrange toolbox items vertically
        left: 'right',
        top: 'center',
        feature: {
          restore: { show: true },
          saveAsImage: { show: true },
          magicType: { show: true, type: ['line', 'bar'] }
        }
      },
      xAxis: {
        type: 'category',
        data: rootData.map(item => item.name)
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          type: 'bar',
          data: rootData,
          label: {
            show: true,
            position: 'inside'
          }
        }
      ]
    }

    // Set the option for root level
    myChart.setOption(option)
    setIsDrilledDown(false)
  }

  return (
    <div className="bg-white w-full flex flex-col justify-start shadow-md rounded-lg">
      <h1 className="p-5 font-bold text-xl text-black flex flex-row justify-center">
        Infected vs Clean
      </h1>
      {isDrilledDown && (
        <div className="flex flex-row items-center justify-between px-5 mb-2">
          <button
            onClick={handleBackClick}
            className="px-3 py-1 bg-blue-500 text-white rounded"
          >
            Back
          </button>
          <h4 className="text-center font-semibold flex-grow">Based on File types</h4>
        </div>
      )}
      <div
        ref={chartRef}
        style={{ width: '100%', height: '300px' }}
        className="bg-white"
      />
    </div>
  )
}

const StackedLineChart = ({ data }) => {
  const chartRef = useRef(null)

  useEffect(() => {
    if (!chartRef.current) return

    // Initialize the chart instance
    const myChart = echarts.init(chartRef.current)

    // Define the chart options
    const option = {
      tooltip: {
        trigger: 'axis',
        formatter: function (params) {
          let tooltip = ''
          const now = new Date()
          const formattedDate = `${String(now.getDate()).padStart(2, '0')}-${String(now.getMonth() + 1).padStart(2, '0')}-${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
          tooltip+= `${formattedDate}<br>`
          params.forEach((item) => {
            tooltip += `${item.marker} ${item.seriesName}: ${item.value} s<br>`
          })
          return tooltip
        }
      },
      legend: {
        data: ['VM1', 'VM2']
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      toolbox: {
        feature: {
          saveAsImage: {}
        }
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: ['VM1', 'VM2']
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          name: 'VM1',
          type: 'line',
          data: [1.0,1.2,2.0,2.2,3.0]
        },
        {
          name: 'VM2',
          type: 'line',
          data: [1.2,1.3,3.1,3.4,4.0]
        }
      ]
    }

    // Set the options
    myChart.setOption(option)

    // Cleanup on component unmount
    return () => {
      myChart.dispose()
    }
  }, [data])

  return (
    <div className="bg-white w-full flex flex-col justify-start shadow-md rounded-lg">
      <h1 className="mt-3 font-bold text-xl text-black flex flex-row justify-center">
        Average Time vs AV&apos;s
      </h1>
      <div
        ref={chartRef}
        style={{ width: '100%', height: '300px' }}
        className="bg-white"
      />
    </div>
  )
}

const RiskMetrics = ({ metrics }) => (
  <div className="bg-white rounded-lg shadow-md p-4">
    <div className="grid grid-cols-5 gap-4">
      <div className="text-center">
        <div className="bg-sky-100 rounded-lg p-3 mb-2">
          <FilesIcon className="w-5 h-5 text-sky-600 mx-auto" />
          <div className="text-lg font-bold">{metrics.totalFiles}</div>
          <div className="text-sm text-gray-500">Total Files</div>
        </div>
      </div>
      <div className="text-center">
        <div className="bg-sky-100 rounded-lg p-3 mb-2">
          <FaFilePdf className="w-5 h-5 text-sky-600 mx-auto" />
          <div className="text-lg font-bold">{metrics.PDFfiles}</div>
          <div className="text-sm text-gray-500">PDF Files</div>
        </div>
      </div>
      <div className="text-center">
        <div className="bg-sky-100 rounded-lg p-3 mb-2">
          <FaFileImage className="w-5 h-5 text-sky-600 mx-auto" />
          <div className="text-lg font-bold">{metrics.Imagefiles}</div>
          <div className="text-sm text-gray-500">Image Files</div>
        </div>
      </div>
      <div className="text-center">
        <div className="bg-sky-100 rounded-lg p-3 mb-2">
          <FaFileAlt className="w-5 h-5 text-sky-600 mx-auto" />
          <div className="text-lg font-bold">{metrics.Docfiles}</div>
          <div className="text-sm text-gray-500">Doc Files</div>
        </div>
      </div>
      <div className="text-center">
        <div className="bg-sky-100 rounded-lg p-3 mb-2">
          <FaFile className="w-5 h-5 text-sky-600 mx-auto" />
          <div className="text-lg font-bold">{metrics.Otherfiles}</div>
          <div className="text-sm text-gray-500">Other Files</div>
        </div>
      </div>
    </div>
  </div>
)

function Overview() {
  const [metrics, setMetrics] = useState({
    totalFiles: 10,
    PDFfiles: 2,
    Imagefiles: 3,
    Docfiles: 4,
    Otherfiles: 1
  })

  const [barChartData, setBarChartData] = useState({
    cleanCount: 0,
    infectedCount: 0,
    cleanPDF: 0,
    cleanImage: 0,
    cleanDoc: 0,
    cleanOther: 0,
    infectedPDF: 0,
    infectedImage: 0,
    infectedDoc: 0,
    infectedOther: 0
  })

  const [lineChartData, setLineChartData] = useState({ vm1: 0, vm2: 0 })

  useEffect(() => {
    // Fetch data from the backend
    const fetchMetrics = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/grouped_scans') // Replace with your API endpoint
        const data = await response.json()
        // Process the data to calculate metrics
        const totalFiles = data.length
        const PDFfiles = data.filter(file => file.file_extension === '.pdf').length
        const Imagefiles = data.filter(file => file.file_extension === '.jpg' || file.file_extension === '.png').length
        const Docfiles = data.filter(file => file.file_extension === '.docx' || file.file_extension === '.doc').length
        const Otherfiles = data.filter(file => !['.doc', '.jpg', '.pdf', '.docx', '.png'].includes(file.file_extension)).length

        setMetrics({
          totalFiles,
          PDFfiles,
          Imagefiles,
          Docfiles,
          Otherfiles
        })

        // Calculate infected and clean counts for bar chart
        const infectedCount = data.filter(file => file.details.some(detail => detail.infected)).length
        const cleanCount = totalFiles - infectedCount

        const cleanPDF = data.filter(file => file.file_extension === '.pdf' && !file.details.some(detail => detail.infected)).length
        const cleanImage = data.filter(file => (file.file_extension === '.jpg' || file.file_extension === '.png') && !file.details.some(detail => detail.infected)).length
        const cleanDoc = data.filter(file => (file.file_extension === '.docx' || file.file_extension === '.doc') && !file.details.some(detail => detail.infected)).length
        const cleanOther = data.filter(file => !['.doc', '.jpg', '.pdf', '.docx', '.png'].includes(file.file_extension) && !file.details.some(detail => detail.infected)).length

        const infectedPDF = data.filter(file => file.file_extension === '.pdf' && file.details.some(detail => detail.infected)).length
        const infectedImage = data.filter(file => (file.file_extension === '.jpg' || file.file_extension === '.png') && file.details.some(detail => detail.infected)).length
        const infectedDoc = data.filter(file => (file.file_extension === '.docx' || file.file_extension === '.doc') && file.details.some(detail => detail.infected)).length
        const infectedOther = data.filter(file => !['.doc', '.jpg', '.pdf', '.docx', '.png'].includes(file.file_extension) && file.details.some(detail => detail.infected)).length

        setBarChartData({
          cleanCount,
          infectedCount,
          cleanPDF,
          cleanImage,
          cleanDoc,
          cleanOther,
          infectedPDF,
          infectedImage,
          infectedDoc,
          infectedOther
        })

        // Calculate average execution time for line chart
        const vm1Times = data.filter(file => file.details.some(detail => detail.vm === 'VM1')).map(file => file.details.find(detail => detail.vm === 'VM1').scan_time)
        const vm2Times = data.filter(file => file.details.some(detail => detail.vm === 'VM2')).map(file => file.details.find(detail => detail.vm === 'VM2').scan_time)

        const averageTime = times => times.reduce((a, b) => a + b, 0) / times.length

        setLineChartData({
          vm1: averageTime(vm1Times),
          vm2: averageTime(vm2Times)
        })
      } catch (error) {
        console.error('Error fetching metrics:', error)
      }
    }

    fetchMetrics()
  }, [])

  return (
    <div>
      <RiskMetrics metrics={metrics} />
      <div className="flex flex-row w-full gap-10 mt-5">
        <EChartsDrilldownBarChart data={barChartData} />
        <StackedLineChart data={lineChartData} />
      </div>
    </div>
  )
}

export default Overview