import * as Widgets from '../widgets';
import { VictoryTheme } from 'victory'
import { dataSet } from "../data/timeseries";
import { colors} from "./colors";
import CountrySelect from "../components/CountrySelect";
import WidgetSelect from "../components/WidgetSelect";
import PropsSelect from "../components/PropsSelect";
import SingleCountrySelect from "../components/SingleCountrySelect";

const dataPoints = {
    deaths: "Deaths total",
    deathsPerM: "Deaths per 1M",
    cases: "Cases total",
    casesPerM: "Cases per 1M",
    //caseMortality: "Deaths per Case",
}
const dataPointsDisplay = {
    deaths: ["Deaths", "Total"],
    deathsPerM: ["Deaths", "per 1M People"],
    cases: ["Cases", "Total"],
    casesPerM: ["Cases", "per 1M People"],
};

export const widgetConfig = {
    /*
    CasesByCountry: {
        name: "Cases By Country",
        component: Widgets.BarGraph,
        parentProps: (userConfig) => ({
            domainPadding: 20,
            theme: VictoryTheme.material,
        }),
        childProps: userConfig => ({
            data: dataSet.country
                .filter(c => userConfig.countries.includes(c.name))
                .map(country => ({country: country.name, cases: country.casesPerM}))
                .sort((a,b) => b.cases - a.cases),
            x: "country",
            y: "cases"
        }),
        config: [{source: "countries", max: 10, prop: "countries"}]
    },

     */
    DataByCountry: TableByCountry("Data Table by Country"),
    DataForCountry: DataForCountry("Individual Data Points"),
    CasesOverTime: LineGraphByCountry( "Total Cases", 'casesOverTime'),
    DeathsOverTime: LineGraphByCountry("Total Deaths", 'deathsOverTime'),
    CasesPerPopulationOverTime: LineGraphByCountry( "Total Cases per 1M People", 'casesPerPopulationOverTime'),
    DeathsPerPopulationOverTime: LineGraphByCountry("Total Deaths per 1M People", 'deathsPerPopulationOverTime'),
    NewCasesOverTime: LineGraphByCountry( "New Cases",'newCasesOverTime'),
    NewDeathsOverTime: LineGraphByCountry("New Deaths",'newDeathsOverTime'),
    NewCasesPerPopulationOverTime: LineGraphByCountry( "New Cases per 1M People",'newCasesPerPopulationOverTime'),
    NewDeathsPerPopulationOverTime: LineGraphByCountry("New Deaths per 1M People",'newDeathsPerPopulationOverTime'),
    Blank: {name: "Blank Space", component: Widgets.BlankWidget, config: [{component: WidgetSelect, props: {}}]}
}
function TableByCountry (name, props)  {
    return {
        name: name,
        component: Widgets.TableByCountry,
        config: [
            {component: WidgetSelect, props: {}},
            {component: CountrySelect, props: {countries: dataSet.countries, max: 20}},
            {component: PropsSelect, props: {max: 4}}
        ],
        dataPoints: dataPoints,
        dataPointsDisplay: dataPointsDisplay,
        tableProps:  (userConfig, countrySelection, prop, ix, isConfiguring) => ({
            data: Math.round(dataSet.country
                .find(c => c.name === countrySelection)[prop]),
            style: {}
        })
    }
}
function DataForCountry(name, props)  {
    return {
        name: name,
        component: Widgets.DataPointsForCountry,
        config: [
            {component: WidgetSelect, props: {}},
            {component: SingleCountrySelect, props: {countries: dataSet.countries}},
            {component: PropsSelect, props: {max: 4}}
        ],
        dataPoints: dataPoints,
        dataPointsDisplay: dataPointsDisplay,
        tableProps:  (userConfig, countrySelection, prop, ix, isConfiguring) => ({
            data: Math.round(dataSet.country
                .find(c => c.name === countrySelection)[prop]),
            style: {}
        })
    }
}
function LineGraphByCountry (name, prop) {
    return {
        name: name,
        parentProps: (userConfig, isConfiguring, editWidget) => ({
            domainPadding: 20,
            theme: VictoryTheme.material,
            padding: {left: 50, top: isConfiguring? 8 : 60, right: 0, bottom: 40},
            height: isConfiguring ? 167 : 250,
        }),
        labelProps: (userConfig) => ({
            title: name,
            x: 20, y: 0, rowGutter: -12,
            style: {labels: {fontSize: 11}},
            padding: {bottom: 20},
            centerTitle: true,
            itemsPerRow: 3,
            data: userConfig.countries.map( (c, ix) => ({name: c, symbol: {fill: colors[ix]}})),
            orientation: "horizontal",
        }),
        component: Widgets.LineGraph,
        config: [
            {component: WidgetSelect, props: {}},
            {component: CountrySelect, props: {countries: dataSet.countries, max: 6}},
        ],
        childProps: (userConfig, countrySelection, ix, isConfiguring) => ({
            data: dataSet.country
                .find(c => c.name === countrySelection)[prop]
                .map((c, ix) => ({x: dataSet.dates[ix].replace(/\/20/,'').replace(/\//, '-'), y: c}))
                .slice(dataSet.dates.length - 30),
            style: {data: {stroke: colors[ix]}, tickLabels: {angle: 45}},
        }),
    }
};
export const widgetNames = Object.getOwnPropertyNames(widgetConfig);
