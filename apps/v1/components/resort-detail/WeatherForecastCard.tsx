import { Resort } from '@/lib/types';
import { Cloud, CloudSnow, Sun, CloudRain, Wind, Droplets } from 'lucide-react';

interface WeatherForecastCardProps {
  resort: Resort;
}

export function WeatherForecastCard({ resort }: WeatherForecastCardProps) {
  if (!resort.weather) {
    return null;
  }

  const { current, forecast } = resort.weather;

  const getWeatherIcon = (condition: string) => {
    const lowerCondition = condition.toLowerCase();
    if (lowerCondition.includes('snow')) {
      return <CloudSnow className="w-8 h-8 text-blue-500" />;
    } else if (lowerCondition.includes('sun')) {
      return <Sun className="w-8 h-8 text-yellow-500" />;
    } else if (lowerCondition.includes('rain')) {
      return <CloudRain className="w-8 h-8 text-gray-500" />;
    } else {
      return <Cloud className="w-8 h-8 text-gray-400" />;
    }
  };

  const getWeatherIconSmall = (condition: string) => {
    const lowerCondition = condition.toLowerCase();
    if (lowerCondition.includes('snow')) {
      return <CloudSnow className="w-6 h-6 text-blue-500" />;
    } else if (lowerCondition.includes('sun')) {
      return <Sun className="w-6 h-6 text-yellow-500" />;
    } else if (lowerCondition.includes('rain')) {
      return <CloudRain className="w-6 h-6 text-gray-500" />;
    } else {
      return <Cloud className="w-6 h-6 text-gray-400" />;
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-md overflow-hidden">
      <div className="p-6">
        <h3 className="text-lg font-semibold mb-4">Weather Forecast</h3>

        {/* Current Weather */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-600 mb-2">Current Conditions</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {getWeatherIcon(current.condition)}
              <div>
                <p className="text-3xl font-bold text-gray-900">{current.temp}°F</p>
                <p className="text-sm text-gray-700">{current.condition}</p>
              </div>
            </div>
            <div className="text-right text-sm space-y-1">
              <div className="flex items-center gap-2 justify-end">
                <Wind className="w-4 h-4 text-gray-600" />
                <span className="text-gray-700">{current.windSpeed} mph</span>
              </div>
              <div className="flex items-center gap-2 justify-end">
                <Droplets className="w-4 h-4 text-gray-600" />
                <span className="text-gray-700">{current.humidity}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* 7-Day Forecast */}
        <div>
          <p className="text-sm font-medium text-gray-700 mb-3">7-Day Forecast</p>
          <div className="space-y-2">
            {forecast.map((day, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1">
                  <span className="text-sm font-medium text-gray-700 w-10">{day.day}</span>
                  {getWeatherIconSmall(day.condition)}
                  <span className="text-xs text-gray-600 flex-1">{day.condition}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 text-sm">
                    <span className="font-semibold text-gray-900">{day.high}°</span>
                    <span className="text-gray-400">/</span>
                    <span className="text-gray-600">{day.low}°</span>
                  </div>
                  {day.snowChance > 30 && (
                    <div className="flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                      <CloudSnow className="w-3 h-3" />
                      <span>{day.snowChance}%</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
