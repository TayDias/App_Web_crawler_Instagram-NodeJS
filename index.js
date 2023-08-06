const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
    const browser = await puppeteer.launch({
        headless: false,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1920,1080', '--headless'],
    })
    // OBS: args: ['--no-sandbox', '--disable-setuid-sandbox'] é necessário para executar no Chromium, no Linux

    const page = await browser.newPage()
    await page.goto('https://www.instagram.com/torradadupla_oficial/?hl=pt')

    //await page.waitForTimeout(4000)
    await new Promise(function(resolve) {setTimeout(resolve, 4000)})
    
    // Screenshot
    await page.screenshot({path: 'instagram.png'})


    // Garimpar dados
    //await scrollToEndOfPage(page)                       // Nem sempre carrega todas as fotos quando são muitas, essa função dá scroll

    const imgList = await page.evaluate(() => {

        const nodeList = document.querySelectorAll('article img')   // Pegar todas as imagens da parte de posts
        const imgArray = [...nodeList]                              // Transformar o NodeList em array

        // Transformar os elementos html em objetos JS
        const imgList = imgArray.map( ( img, index ) => ({
            id: index + 1,
            src: img.src
        }))

        return imgList

    })


    // Escrever os dados em um arquivo local
    fs.writeFile('instagram.json', JSON.stringify(imgList, null, 2), err => { 
        if(err) { throw new Error('Error') }

        console.log('Success')
    })
    // OBS: O 2 do stringify formata o arquivo com dois espaços


    await browser.close()

})()

async function scrollToEndOfPage(
    page,
    extractImgLinks = () => {},
) {
    let items = [];
    try {
        let previousHeight;
        while (true) {
            const curHeight = await page.evaluate('document.body.scrollHeight');
            if (previousHeight === curHeight) {
                break;
            }
            previousHeight = curHeight;
            await page.evaluate('window.scrollTo(0, document.body.scrollHeight)');
            await page.waitForFunction(`document.body.scrollHeight > ${previousHeight}`);
            await page.waitFor(3500);
            const links = await page.evaluate(extractImgLinks).catch(err => {
                console.log(err);
                return [];
            });
            items = [...items, ...links];
        }
    } catch (e) {
    }
    return items;
}