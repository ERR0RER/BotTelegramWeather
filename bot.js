const { Telegraf } = require('telegraf');
const AXIOS = require('axios');

const TOKEN = 'Insert your token here';
const OPENWEATHER_API_KEY = 'Insert your API here';

const bot = new Telegraf(TOKEN);

const WEATHER_API_URL = 'https://api.openweathermap.org/data/2.5/weather';

bot.start((ctx) => {
	ctx.reply('Send me your geolocation.')
  ctx.reply('Choose an option:', {
    reply_markup: {
      keyboard: [
        [{ text: 'Send Geolocation', request_location: true }],
      ],
      resize_keyboard: true
    }
  });
});

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

async function getWeather(latitude, longitude) {
  try {
    const response = await AXIOS.get(WEATHER_API_URL, {
      params: {
        lat: latitude,
        lon: longitude,
        appid: OPENWEATHER_API_KEY,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching weather:', error);
    throw new Error('Failed to fetch weather data');
  }
}

bot.on('message', (ctx) => {
  if (ctx.message.location) {
    const { latitude, longitude } = ctx.message.location;
    getWeather(latitude, longitude)
      .then((data) => {
        const temperatureInKelvin = data.main.temp;
        const temperatureInCelsius = temperatureInKelvin - 273.15;
        const cityName = data.name;
        const weatherDescription = data.weather[0].main;
        ctx.reply(`${cityName}: ${weatherDescription} ${temperatureInCelsius.toFixed(2)} °C`);
      })
      .catch((error) => {
        console.error('Error handling weather data:', error);
        ctx.reply('Sorry, something went wrong while fetching the weather.');
      });
  } else if (ctx.message.text === 'Send Geolocation' && ctx.message.location) {
    const { latitude, longitude } = ctx.message.location;
    ctx.replyWithLocation(latitude, longitude);
  } else {
    ctx.reply('Choose an option:', {
      reply_markup: {
        keyboard: [
          [{ text: 'Send Geolocation', request_location: true }],
        ],
        resize_keyboard: true
      }
    });
  }
});

bot.launch();
