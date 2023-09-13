import { LightningElement ,api} from 'lwc';
import chartjs from '@salesforce/resourceUrl/chartJs';
import { loadScript } from 'lightning/platformResourceLoader';
import { gql, graphql } from "lightning/uiGraphQLApi";
import getExpenses from '@salesforce/apex/CharController.getExpenses';
import saveImage from '@salesforce/apex/CharController.saveImage';
/**
 * When using this component in an LWR site, please import the below custom implementation of 'loadScript' module
 * instead of the one from 'lightning/platformResourceLoader'
 *
 * import { loadScript } from 'c/resourceLoader';
 *
 * This workaround is implemented to get around a limitation of the Lightning Locker library in LWR sites.
 * Read more about it in the "Lightning Locker Limitations" section of the documentation
 * https://developer.salesforce.com/docs/atlas.en-us.exp_cloud_lwr.meta/exp_cloud_lwr/template_limitations.htm
 */

const generateRandomNumber = () => {
    return Math.round(Math.random() * 100);
};



export default class Char extends LightningElement {
    error;
    chart;
    chartjsInitialized = false;
    @api startDate;
    @api endDate;
    totalAmount;

    async saveImage(){
        const base64Str = this.chart.toBase64Image('image/png');
        console.log(base64Str);
        const base64Mark = 'base64,';
        const dataStart = base64Str.indexOf(base64Mark) + base64Mark.length;

        const base64Data = base64Str.substring(dataStart);

        await saveImage ( {fileName: `Expenses-${this.startDate}-${this.endDate}.png`,base64Str:base64Data});
    }

    async renderedCallback() {
        if (this.chartjsInitialized) {
            return;
        }
        this.chartjsInitialized = true;

        const expenses = await getExpenses({startDate:this.startDate, endDate:this.endDate});
        this.totalAmount = expenses.reduce((acc,expenses)=>acc+=expenses.Amount__c,0);

        const data = expenses.reduce((acc, expense)=>{
            if(acc[expense.Expense_Type__c]){
             acc[expense.Expense_Type__c] += expense.Amount__c;
            } else{
             acc[expense.Expense_Type__c] = expense.Amount__c;
            }
            return acc;
         },{})
         console.log(data);


    const config = {
        type: 'doughnut',
        data: {
            datasets: [
                {
                    data: Object.values(data),
                    backgroundColor: [
                        'rgb(255, 99, 132)',
                        'rgb(255, 159, 64)',
                        'rgb(255, 205, 86)',
                        'rgb(75, 192, 192)',
                        'rgb(54, 162, 235)'
                    ],
                    label: 'Dataset 1'
                }
            ],
            labels: Object.keys(data)
        },
        options: {
            responsive: false,
            plugins: {
                legend: {
                    position: 'right'
                }
            },
            animation: {
                animateScale: true,
                animateRotate: true
            }
        }
    };

        try {
            await loadScript(this, chartjs);
            const canvas = document.createElement('canvas');
            this.template.querySelector('div.chart').appendChild(canvas);
            const ctx = canvas.getContext('2d');
            this.chart = new window.Chart(ctx, config);
        } catch (error) {
            this.error = error;
        }
    }
}