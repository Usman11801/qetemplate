// src/pages/leaderboard.js
import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  query,
  where,
  onSnapshot
} from "firebase/firestore";

/**
 * Leaderboard: listens to Firestore for real-time updates to respondents & responses
 * that match the given sessionId. Then shows (name, totalScore) sorted descending.
 */
function Leaderboard({ sessionId }) {
  const [respondents, setRespondents] = useState([]);
  const [responses, setResponses] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);

  /**
   * 1) Listen to the 'respondents' collection, filtering by sessionId.
   */
  useEffect(() => {
    if (!sessionId) return;
    const q = query(
      collection(db, "respondents"),
      where("sessionId", "==", sessionId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const respList = [];
      snapshot.forEach((docSnap) => {
        respList.push({ id: docSnap.id, ...docSnap.data() });
      });
      setRespondents(respList);
    });

    return () => unsubscribe();
  }, [sessionId]);

  /**
   * 2) Listen to the 'responses' collection, filtering by sessionId.
   */
  useEffect(() => {
    if (!sessionId) return;
    const q = query(
      collection(db, "responses"),
      where("sessionId", "==", sessionId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const responseList = [];
      snapshot.forEach((docSnap) => {
        responseList.push({ id: docSnap.id, ...docSnap.data() });
      });
      setResponses(responseList);
    });

    return () => unsubscribe();
  }, [sessionId]);

  /**
   * 3) Join respondents + responses => build an array of
   *    [ { name, totalScore, respondentId }, ... ].
   */
  useEffect(() => {
    // For each respondent doc, find its matching response doc, if any:
    const combined = respondents.map((r) => {
      // Look up the response with the same respondentId
      const matchingResponse = responses.find(
        (res) => res.respondentId === r.id
      );
      return {
        name: r.name || "Guest",
        respondentId: r.id,
        totalScore: matchingResponse?.totalScore ?? 0
      };
    });

    // Sort descending by totalScore
    combined.sort((a, b) => b.totalScore - a.totalScore);
    setLeaderboard(combined);
  }, [respondents, responses]);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mt-8">
      <h2 className="text-2xl font-semibold mb-4">Leaderboard</h2>
      {leaderboard.length === 0 ? (
        <p className="text-gray-500">No one has joined yet!</p>
      ) : (
        <ul>
          {leaderboard.map((item, idx) => (
            <li
              key={item.respondentId}
              className="py-2 flex justify-between border-b border-gray-200 last:border-b-0"
            >
              <span>
                <strong>{idx + 1}.</strong> {item.name}
              </span>
              <span className="font-medium">{item.totalScore} pts</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Leaderboard;
