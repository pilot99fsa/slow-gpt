import React, { useCallback, useEffect, useState, useRef } from "react";
import axios from "axios";
import "./style.css";
import reimu from "./image/ゆっくり霊夢.png";
import marisa from "./image/ゆっくり魔理沙.png";

const API_URL = "https://api.openai.com/v1/";
const MODEL = "gpt-3.5-turbo";
const API_KEY = "ここにChat-GPTのAPIキーを入力";

export const YukkuriChat = () => {
  const [message, setMessage] = useState("");

  const [answer, setAnswer] = useState("");

  const [conversation, setConversation] = useState([]);

  const [loading, setLoading] = useState(false);

  const prevMessageRef = useRef("");

  useEffect(() => {
    // 直前のチャット内容
    const newConversation = [
      {
        role: "assistant",
        content: answer,
      },
      {
        role: "user",
        content: message,
      },
    ];

    setConversation([...conversation, ...newConversation]);

    setMessage("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answer]);

  const handleSubmit = useCallback(
    async (event) => {
      event.preventDefault();

      if (!message) {
        alert("メッセージがありません。");
        return;
      }

      if (loading) return;

      setLoading(true);

      try {
        const response = await axios.post(
          `${API_URL}chat/completions`,
          {
            model: MODEL,
            messages: [
              ...conversation,
              {
                role: "user",
                content: message,
              },
            ],
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${API_KEY}`,
            },
          }
        );

        setAnswer(response.data.choices[0].message.content.trim());
      } catch (error) {
        // エラーハンドリング
        console.error(error);
      } finally {
        // 後始末
        setLoading(false); // ローディング終了
        prevMessageRef.current = message; // 今回のメッセージを保持
      }
    },
    [loading, message, conversation]
  );

  // チャット内容
  const ChatContent = React.memo(({ prevMessage, answer }) => {
    return (
      <div className="result">
        <div className="yukkuri-marisa-answer">
          <div className="current-message">
            <h2>質問:</h2>
            <p>{prevMessage}</p>
          </div>
          <div className="current-answer">
            <h2>回答:</h2>
            <p>
              {answer.split(/\n/).map((item, index) => {
                return (
                  <React.Fragment key={index}>
                    {item}
                    <br />
                  </React.Fragment>
                );
              })}
            </p>
          </div>
        </div>
        <div className="marisa-face">
          <img src={marisa} alt="ゆっくり魔理沙" />
        </div>
      </div>
    );
  });

  // フォームの表示
  return (
    <div className="container">
      <header>【React.js】ゆっくり質問していってね!【Chat-GPT3.5】</header>
      <div className="yukkuri-reimu">
        <div className="reimu-face">
          <img src={reimu} alt="ゆっくり霊夢" />
        </div>
        <div className="yukkuri-chat-aria">
          <form className="chat-form" onSubmit={handleSubmit}>
            <label>
              <textarea
                className="message"
                rows="5"
                cols="50"
                value={message}
                placeholder="ゆっくり質問していってね！"
                onChange={(e) => {
                  setMessage(e.target.value);
                }}
              />
            </label>
            <div className="submit">
              <button type="submit">質問する</button>
            </div>
          </form>
        </div>
      </div>
      {loading && (
        <div className="loading">
          <p>回答中...ゆっくり待ってね！</p>
        </div>
      )}
      {answer && !loading && (
        <ChatContent prevMessage={prevMessageRef.current} answer={answer} />
      )}
    </div>
  );
};

export default YukkuriChat;
