import asyncio
import json
import logging
import re
import aiohttp

from datetime import datetime, timedelta

import websockets
from aiofile import async_open

PB_API = "https://api.privatbank.ua/p24api/exchange_rates?json&date="

logging.basicConfig(level=logging.INFO)


class PBExchange:
    async def get_tday_info_from_api(self, date):
        async with aiohttp.ClientSession() as session:
            async with session.get(PB_API + date) as response:
                if response.status != 200:
                    logging.info(f"{PB_API + date}")
                data = await response.json()
                result = {}
                for item in data['exchangeRate']:
                    result[item['currency']] = {
                        'sale': item.get('saleRate', item['saleRateNB']),
                        'purchase': item.get('purchaseRate', item['purchaseRateNB'])
                    }
                return {f'{date}': result}

    def __get_dates_until(self, number_of_days):
        if number_of_days > 10:
            dates = []
            return dates
        dates = []
        today = datetime.now().date()  # Сегодняшняя дата
        dates.append(today.strftime("%d.%m.%Y"))  # Добавляем сегодняшнюю дату в формате strftime

        for i in range(1, number_of_days):
            date = today - timedelta(days=i)  # Вычитаем i дней от сегодняшней даты
            dates.append(date.strftime("%d.%m.%Y"))  # Добавляем дату в формате strftime

        return dates

    async def get_rate_for_dates(self, number_of_days: int):
        dates = self.__get_dates_until(number_of_days)

        gathers = []
        for date in dates:
            gather = self.get_tday_info_from_api(date)
            gathers.append(gather)

        rates = await asyncio.gather(*gathers)
        results = {}
        for rate in rates:
            results.update(rate)
        result_json = json.dumps(results)
        return result_json


async def log_command_triggered():
    async with async_open('logs.log', 'a') as afp:
        await afp.write(f'{str(datetime.now())}: command triggered.\n')


async def process_exchange_command(message: str):
    command_pattern = r"-exchange\s*(\d+)?"
    match = re.match(command_pattern, message)
    if match is None:
        return None

    num_days = match.group(1)
    if not num_days.isdigit() or int(num_days) > 10:
        return "Ошибка в параметрах. Количество дней должно быть числом от 1 до 10."

    await log_command_triggered()

    exchange = PBExchange()
    rates = await exchange.get_rate_for_dates(int(num_days))
    return rates


async def message_listener(message: str):
    rates = await process_exchange_command(message)
    return rates


async def main(hostname: str, port: int):
    ws_resource_url = f"ws://{hostname}:{port}"
    async with websockets.connect(ws_resource_url) as ws:
        async for message in ws:
            logging.info(f"Message: {message}")
            respond = await message_listener(message)
            if respond is not None:
                await ws.send(str(respond))



if __name__ == "__main__":
    asyncio.run(main('localhost', 8080))
