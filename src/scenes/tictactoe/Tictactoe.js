import React, { useState, useEffect, useContext } from 'react';
import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import ScreenTemplate from '../../components/ScreenTemplate';
import { useRoute, useNavigation } from '@react-navigation/native';
import { firestore } from '../../firebase/config';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';

const initialBoard = Array(9).fill(null);

export default function TicTacToe() {
  const [board, setBoard] = useState(initialBoard);
  const [currentPlayer, setCurrentPlayer] = useState('player1');
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState(null);
  const route = useRoute();
  const gameId = route.params.id;
  

  const gameRef = doc(firestore, 'games', "N7BAp8G54e9nyQ4okJY9");

  const navigation = useNavigation();

  useEffect(() => {
    // Listen for real-time updates from Firestore
    // const gameRef = doc(firestore, 'games', route.params.id);
    console.log('26: ', route.params.id)
    const unsubscribe = onSnapshot(gameRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setBoard(data.board);
        setCurrentPlayer(data.currentPlayer);
        setGameOver(data.gameOver);
        setWinner(data.winner);
      }
    });

    return () => unsubscribe();
  }, [gameRef]);

  const handlePress = async (index) => {
    if (board[index] || gameOver) return;

    const newBoard = [...board];
    newBoard[index] = currentPlayer === 'player1' ? 'X' : 'O';

    // Check for win or draw
    const winner = checkWinner(newBoard);
    const isGameOver = winner || newBoard.every(cell => cell);

    await updateDoc(gameRef, {
      board: newBoard,
      currentPlayer: currentPlayer === 'player1' ? 'player2' : 'player1',
      gameOver: isGameOver,
      winner: winner
    });
  };

  const checkWinner = (board) => {
    // Winning combinations using the board index
    const lines = [
      [0, 1, 2], // first row
      [3, 4, 5], // second row
      [6, 7, 8], // third row
      [0, 3, 6], // first column
      [1, 4, 7], // second column
      [2, 5, 8], // third column
      [0, 4, 8], // first diagonal
      [2, 4, 6], // second diagonal
    ];
  
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a] === 'X' ? 'player1' : 'player2';
      }
    }
  
    return null;
  };

  const renderCell = (index) => {
    return (
      <TouchableOpacity
        style={styles.cell}
        onPress={() => handlePress(index)}
        disabled={currentPlayer !== 'player1' && currentPlayer !== 'player2'}
      >
        <Text style={styles.cellText}>{board[index]}</Text>
      </TouchableOpacity>
    );
  };
  console.log('92: ', board)
  return (
    <ScreenTemplate>
      <View style={styles.board}>
      {Array.isArray(board) ? board.map((_, index) => renderCell(index)) : null}
      </View>
      {gameOver && (
        <Text style={styles.gameOverText}>
          {winner ? `Winner: ${winner}` : 'Draw'}
        </Text>
      )}
    </ScreenTemplate>
  );
}

const styles = StyleSheet.create({
  board: {
    width: '100%',
    aspectRatio: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cell: {
    width: '33.33%',
    height: '33.33%',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#000',
  },
  cellText: {
    fontSize: 40,
  },
  gameOverText: {
    fontSize: 24,
    textAlign: 'center',
    marginTop: 20,
  },
});