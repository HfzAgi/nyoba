// Supabase Configuration
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const SUPABASE_URL = "https://yauikecjdvyububhnwvi.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhdWlrZWNqZHZ5dWJ1Ymhud3ZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE2NTg0NDgsImV4cCI6MjA0NzIzNDQ0OH0.QoX0vft04a7MICCZ1wfeFt_kaBcKNKwHq5Rtjo6jp3o";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Google Charts
google.charts.load('current', { packages: ['corechart', 'line'] });
google.charts.setOnLoadCallback(() => {
    console.log("Google Charts Loaded");
    drawChart();
});

let chart, dataTable, options;
const visibleColumns = [0, 1, 2, 3, 4, 5, 6];

function drawChart() {
    dataTable = new google.visualization.DataTable();
    dataTable.addColumn('string', 'Time');
    dataTable.addColumn('number', 'pH');
    dataTable.addColumn('number', 'DO');
    dataTable.addColumn('number', 'Water Level');
    dataTable.addColumn('number', 'Temperature');
    dataTable.addColumn('number', 'Turbidity');
    dataTable.addColumn('number', 'TDS');

    options = {
        hAxis: { title: 'Time', gridlines: { color: '#f1f1f1' } },
        vAxis: { title: 'Value', gridlines: { color: '#f1f1f1' } },
        legend: { position: 'bottom' },
        chartArea: { width: '80%', height: '70%' },
        colors: ['#1E88E5', '#D32F2F', '#7CB342', '#FF8F00', '#8E24AA', '#FBC02D'],
        backgroundColor: { fill: '#f5f5f5' },
        lineWidth: 3,
        pointSize: 5,
    };

    chart = new google.visualization.LineChart(document.getElementById('sensorChart'));
    fetchSupabaseData();
    setupToggleButtons();

    // Tambahkan event listener untuk membuat grafik responsif
    window.addEventListener('resize', () => {
        chart.draw(dataTable, options);
    });
}

async function fetchSupabaseData() {
    try {
        const { data, error } = await supabase
            .from('sensorData')
            .select('*')
            .order('timestamp', { ascending: true });

        if (error) {
            console.error('Error fetching data from Supabase:', error);
            return;
        }

        if (data) {
            console.log('Data fetched from Supabase:', data);

            const formattedData = data.map(item => [
                item.timestamp || '',
                item.ph || 0,
                item.do || 0,
                item.waterLevel || 0,
                item.temperature || 0,
                item.turbidity || 0,
                item.tds || 0,
            ]);

            console.log('Formatted Data:', formattedData);

            dataTable.removeRows(0, dataTable.getNumberOfRows());
            dataTable.addRows(formattedData);

            updateChart();
        }
    } catch (error) {
        console.error('Unexpected error:', error);
    }
}

function setupToggleButtons() {
    document.getElementById('toggle-ph').addEventListener('click', () => toggleColumn(1));
    document.getElementById('toggle-do').addEventListener('click', () => toggleColumn(2));
    document.getElementById('toggle-water').addEventListener('click', () => toggleColumn(3));
    document.getElementById('toggle-temp').addEventListener('click', () => toggleColumn(4));
    document.getElementById('toggle-turbidity').addEventListener('click', () => toggleColumn(5));
    document.getElementById('toggle-tds').addEventListener('click', () => toggleColumn(6));
}

function toggleColumn(columnIndex) {
    const columnPos = visibleColumns.indexOf(columnIndex);
    if (columnPos > -1) {
        visibleColumns.splice(columnPos, 1);
    } else {
        visibleColumns.push(columnIndex);
    }
    updateChart();
}

function updateChart() {
    const view = new google.visualization.DataView(dataTable);
    view.setColumns(visibleColumns);
    chart.draw(view, options);
    console.log('Chart updated');
}
