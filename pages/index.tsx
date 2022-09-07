import React, { useCallback, useRef, useState, useEffect } from 'react';
import { toPng } from 'html-to-image';
import Head from "next/head";
import Image from "next/image";
import axios from "axios";

const App: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null)

  const [verses, setVerses] = useState([]);
  const [name, setName] = useState("");
  const [chapter, setChapter] = useState("");
  const [number, setNumber] = useState(1);

  useEffect(() => {
    axios.get('https://www.abibliadigital.com.br/api/verses/nvi/rm/3')
      .then(
        (response) => {
          console.log(response)
          setName(response.data.book.name);
          setChapter(response.data.chapter.number);
          setVerses(response.data.verses)
          setNumber(response.data.verses[0].number)
          console.log(verses);
        }
      )
  }, [])
  const changeNumber = (value) => {
    setNumber(number + value);
  }
  const onButtonClick = useCallback((download_name) => {
    if (ref.current === null) {
      return
    }

    toPng(ref.current, { cacheBust: true, })
      .then((dataUrl) => {
        const link = document.createElement('a')
        link.download = download_name
        link.href = dataUrl
        link.click()
      })
      .catch((err) => {
        console.log(err)
      })
  }, [ref])

  return (
    <>
      <div ref={ref} className="h-fit m-0 p-0">
        <Image src="/template.png" alt="Igreja" width={2059} height={371} />
        <div className="absolute top-3 w-[252px] h-[58px]">
          <h1 className="text-center text-3xl font-medium block ">{`${name} ${chapter}:${number}`}</h1>
        </div>
        <div className='absolute top-[3.6rem] left-64 w-[1100px] h-[190px]'>
          <div className='flex flex-col h-full text-center justify-center align-middle'>
            <p className='text-white text-3xl mx-20'>{verses[number - 1]?.text}</p>
          </div>
        </div>
      </div>
      <button onClick={() => changeNumber(-1)}>-</button>
      <button onClick={() => changeNumber(1)}>+</button>
      <button onClick={() => onButtonClick(`template_${name}_${chapter}_${number}`)}>Click me</button>
    </>
  )
}

export default App;