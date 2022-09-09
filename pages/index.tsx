import axios from "axios";
import { saveAs } from 'file-saver';
import { toPng } from "html-to-image";
import JSZipUtils from 'jszip-utils';
import Image from "next/image";
import React, { useCallback, useRef, useState } from 'react';
const zip = require('jszip')()
var slugify = require('slugify')

const App: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null)

  const [verses, setVerses] = useState([]);
  const [links, setLinks] = useState([]);
  const [name, setName] = useState("");
  const [abbrev, setAbbrev] = useState("");
  const [chapter, setChapter] = useState("");
  const [number, setNumber] = useState(1);

  // useEffect(() => {
  //   axios.get('https://www.abibliadigital.com.br/api/verses/nvi/rm/3')
  //     .then(
  //       (response) => {
  //         console.log(response)
  //         setName(response.data.book.name);
  //         setChapter(response.data.chapter.number);
  //         setVerses(response.data.verses)
  //         setNumber(response.data.verses[0].number)
  //         console.log(verses);
  //       }
  //     )
  // }, [])

  const getVerses = (input) => {
    let [abbrev, chapter, start, end] = input.split(/[\' \']|[\:]|[\-]/)
    axios.get(`https://www.abibliadigital.com.br/api/verses/nvi/${abbrev.toLowerCase()}/${chapter}`)
      .then((response) => {
        let verses = response.data.verses.slice(start - 1, end)
        console.log('get', response)
        setAbbrev(abbrev)
        setChapter(chapter)
        setVerses(verses)
        setNumber(start)
      }
      )
  }

  const generateImages = () => {
    let verseElement = document.getElementById('text')
    let titleElement = document.getElementById('title')
    let titleWithoutNumber = titleElement.innerHTML

    verses.forEach(v => {
      console.log('verse', v)
      verseElement.innerHTML = v.text
      titleElement.innerHTML = titleWithoutNumber + v.number
      toPng(document.getElementById('myImg'), { cacheBust: true, })
        .then((dataUrl) => {
          const link = document.createElement('a')
          link.download = `template_${abbrev}_${chapter}_${v.number}`
          link.href = dataUrl
          console.log('ksks', dataUrl)
          setLinks(state => [...state, link])
        })
        .catch((err) => {
          console.log(err)
        })
    })
  }

  // function generateZIP() {
  //   console.log('TEST');
  //   var zip = new JSZip();
  //   var count = 0;
  //   var zipFilename = "Pictures.zip";

  //   links.forEach(function (url, i) {
  //     var filename = links[i];
  //     // filename = filename.replace(/[\/\*\|\:\<\>\?\"\\]/gi, '').replace("httpsi.imgur.com","");
  //     // loading a file and add it in a zip file
  //     JSZipUtils.getBinaryContent(url, function (err, data) {
  //       if (err) {
  //         throw err; // or handle the error
  //       }
  //       zip.file(filename, data, { binary: true });
  //       count++;
  //       if (count == links.length) {
  //         zip.generateAsync({ type: 'blob' }).then(function (content) {
  //           saveAs(content, zipFilename);
  //         });
  //       }
  //     });
  //   });
  // }



  const onButtonClick = useCallback((name, start) => {
    console.log('name', slugify(name, { replacement: '_', lower: true, strict: false }))
    // if (ref.current === null) {
    //   return
    // }
    let images = document.getElementById("images")
    // var zip = new JSZip();
    var count = 0;
    var zipFilename = `${slugify(name, { replacement: '_', lower: true, strict: false })}.zip`;
    for (let i = 0; i < images.childElementCount; i++) {
      let image = document.getElementById(`template_${i + parseInt(start)}`)
      // console.log(i+parseInt(start),image, typeof(image))
      toPng(image, { cacheBust: true, })
        .then((dataUrl) => {
          let filename = `template_${abbrev.toLowerCase()}_${chapter}_${i + parseInt(start)}`
          const link = document.createElement('a')
          link.download = filename
          link.href = dataUrl
          // link.click()
          const img = document.createElement('img')
          img.src = link.href
          // console.log('dataUrl',img, typeof(JSZipUtils))
          console.log('JSZipUtils', typeof (JSZipUtils))
          JSZipUtils.getBinaryContent(dataUrl, function (err, data) {
            if (err) {
              throw err; // or handle the error
            }
            zip.file(`${filename}.png`, data, { binary: true });
            count++;
            if (count == images.childElementCount) {
              zip.generateAsync({ type: 'blob' }).then(function (content) {
                saveAs(content, zipFilename);
              });
            }
          });
        })
        .catch((err) => {
          console.log(err)
        })
    }
  }, [ref])

  return (
    <>
      <div className="h-screen">
      <div className="text-center my-4">
        <input
          value={name} onChange={(e) => setName(e.target.value)}
          placeholder="Ex.: Rm 1:3-10"
          className="h-10 w-64 px-2 border border-black"
        ></input>
        <button
          className="mx-2 p-3 border rounded-md text-white bg-blue-600"
          onClick={() => getVerses(name)}
        >Gerar Imagens</button>
        <button
        className="p-3 my-3 border rounded-md text-white bg-blue-600"
        onClick={() => onButtonClick(name, number)}
      >Baixar Imagens</button>
      </div>

      <div id="images" className="h-3/4 overflow-y-scroll bg-green-700">
        <>
          {
            verses.map((v) => {
              return (
                <>
                  <div key={v} id={`template_${v?.number}`} className="h-fit m-0 p-0 relative">
                    <Image src="/template.png" alt="Igreja" width={2059} height={371} />
                    <div className="absolute top-3 w-[252px] h-[58px]">
                      <h1 id='title' className="text-center text-3xl font-medium block ">{`${abbrev} ${chapter}:${v?.number}`}</h1>
                    </div>
                    <div className='absolute top-[3.6rem] left-64 w-[1100px] h-[190px]'>
                      <div className='flex flex-col h-full text-center justify-center align-middle'>
                        <p id='text' className='text-white text-3xl mx-20'>{v?.text}</p>
                      </div>
                    </div>
                  </div>
                </>
              )

            })
          }
        </>
      </div>
      </div>
    </>
  )
}

export default App;