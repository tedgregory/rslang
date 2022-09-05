import React, { useEffect, useState } from 'react'
import { wordsAPI } from 'src/services/WordsService'
import { clsx } from 'src/utils/clsx'
import styles from './Detail.module.scss'
import { IWord } from '../../../models/IWord'
import { useAudio } from '../../../hooks/useAudio'
import { userWordsAPI } from '../../../services/UsersWordsService'
import { localStorageGet } from '../../../utils/localStoradre'
import { useAppSelector } from '../../../hooks/redux'
import { useDispatch } from 'react-redux'
import { userWordsSlice } from '../../../store/reducers/userWordsSlice'

const Detail: React.FC<any> = (props) => {
  const { id, complete: isComplete, hard: isHard } = props
  const dispatch = useDispatch()

  const { data: wordData, refetch } = wordsAPI.useFetchWordByIdQuery(id)
  useEffect(() => {
    refetch()
  }, [id])
  const [postWord] = userWordsAPI.usePostUserWordMutation()
  const [updateUserWord] = userWordsAPI.useUpdateUserWordMutation()
  const [deleteWord] = userWordsAPI.useDeleteUserWordMutation()
  const local = localStorageGet(['userId'])
  const [playing, toggle] = useAudio(`https://rs-lang-193.herokuapp.com/${wordData?.audio}`)
  // TODO: сделать логику добавления в сложные

  const hardHandler = () => {
    // @ts-ignore
    dispatch(userWordsSlice.actions.deleteCompletedWord(id))
    // @ts-ignore
    dispatch(userWordsSlice.actions.deleteHardWord(id))
    if (isComplete) {
      updateUserWord({ id: local['userId'], difficulty: 'hard', wordId: id })
    }
    if (isHard) {
      deleteWord({ id: local['userId'], wordId: id })
    }
    if (!isComplete && !isHard) postWord({ id: local['userId'], difficulty: 'hard', wordId: id })
  }
  // TODO: сделать логику добавления в изученные
  const completeHandler = () => {
    // @ts-ignore
    dispatch(userWordsSlice.actions.deleteCompletedWord(id))
    // @ts-ignore
    dispatch(userWordsSlice.actions.deleteHardWord(id))
    if (isHard) {
      // @ts-ignore
      dispatch(userWordsSlice.actions.deleteHardWord(id))
      updateUserWord({ id: local['userId'], difficulty: 'completed', wordId: id })
    }
    if (isComplete) {
      deleteWord({ id: local['userId'], wordId: id })
    }

    if (!isComplete && !isHard)
      postWord({ id: local['userId'], difficulty: 'completed', wordId: id })
  }

  const soundHandler = () => {
    toggle()
  }

  return (
    <article
      className={clsx({
        [styles.detail]: true,
        [styles.detailComplete]: isComplete,
        [styles.detailHard]: isHard,
      })}
    >
      <div className={styles.detailMain}>
        <h3 className={styles.detailTitle}>{wordData && wordData.word}</h3>
        <button
          className={clsx({
            [styles.detailSound]: true,
            ['_icon-sound']: true,
            [styles.soundOn]: playing,
          })}
          onClick={soundHandler}
        ></button>
        <span className={styles.detailTranscription}>{wordData && wordData.transcription}</span>
        <p className={styles.detailTranslate}>{wordData && wordData.wordTranslate}</p>
        <hr className={styles.detailLine} />
      </div>
      <div className={styles.detailMore}>
        <ul className={styles.detailList}>
          <li className={styles.detailItem}>
            <h4 className={styles.detailSubtitle}>Значение слова</h4>
            {wordData && (
              <p
                className={styles.detailText}
                dangerouslySetInnerHTML={{ __html: wordData.textMeaning }}
              ></p>
            )}
            <p className={styles.detailText}>{wordData && wordData.textMeaningTranslate}</p>
          </li>
          <li className={styles.detailItem}>
            <h4 className={styles.detailSubtitle}>Пример использования</h4>
            {wordData && (
              <p
                className={styles.detailText}
                dangerouslySetInnerHTML={{ __html: wordData.textExample }}
              ></p>
            )}
            <p className={styles.detailText}>{wordData && wordData.textExampleTranslate}</p>
          </li>
        </ul>
      </div>
      <div className={styles.detailImage}>
        <img
          src={wordData && `https://rs-lang-193.herokuapp.com/${wordData.image}`}
          alt={wordData && wordData.word}
        />
      </div>
      <div className={styles.detailControl}>
        <button
          className={clsx({
            [styles.controlBtn]: true,
            [styles.controlHard]: true,
            ['_icon-bookmark']: true,
          })}
          onClick={hardHandler}
        >
          <span>Сложное</span>
        </button>
        <button
          className={clsx({
            [styles.controlBtn]: true,
            [styles.controlComplete]: true,
            ['_icon-star']: true,
          })}
          onClick={completeHandler}
        >
          <span>Изучено</span>
        </button>
      </div>
    </article>
  )
}

export default Detail
