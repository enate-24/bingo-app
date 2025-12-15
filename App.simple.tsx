import React, {useState} from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
  TextInput,
  Dimensions,
} from 'react-native';

const {width} = Dimensions.get('window');

interface BingoCard {
  id: number;
  name: string;
  numbers: (number | string)[][];
  expanded: boolean;
}

// Simple hardcoded test data instead of importing cartela.js
const testBingoCard: (number | string)[][] = [
  [8, 3, 13, 6, 2],
  [19, 29, 28, 26, 18],
  [37, 42, "FREE", 32, 40],
  [59, 54, 60, 58, 48],
  [75, 68, 71, 64, 70]
];

const App = (): JSX.Element => {
  const [cards, setCards] = useState<BingoCard[]>([
    {
      id: 1,
      name: 'No- 1',
      numbers: testBingoCard,
      expanded: false,
    },
  ]);
  
  const [modalVisible, setModalVisible] = useState(false);
  const [newCardName, setNewCardName] = useState('');

  const addNewCard = () => {
    const newCardId = cards.length + 1;
    const newCard: BingoCard = {
      id: newCardId,
      name: newCardName || `No- ${newCardId}`,
      numbers: testBingoCard,
      expanded: false,
    };
    setCards([...cards, newCard]);
    setModalVisible(false);
    setNewCardName('');
  };

  const toggleCardExpansion = (cardId: number) => {
    setCards(cards.map(card => 
      card.id === cardId 
        ? {...card, expanded: !card.expanded}
        : {...card, expanded: false}
    ));
  };

  const renderBingoCard = (card: BingoCard) => {
    const letters = ['B', 'I', 'N', 'G', 'O'];
    
    return (
      <TouchableOpacity
        key={card.id}
        style={[
          styles.card,
          card.expanded && styles.expandedCard
        ]}
        onPress={() => toggleCardExpansion(card.id)}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{card.name}</Text>
          <View style={styles.redDot} />
        </View>
        
        <View style={styles.bingoGrid}>
          <View style={styles.headerRow}>
            {letters.map((letter, index) => (
              <View key={index} style={styles.headerCell}>
                <Text style={styles.headerText}>{letter}</Text>
              </View>
            ))}
          </View>
          
          {[0, 1, 2, 3, 4].map(row => (
            <View key={row} style={styles.numberRow}>
              {[0, 1, 2, 3, 4].map(col => (
                <View 
                  key={col} 
                  style={[
                    styles.numberCell,
                    (card.numbers[col][row] === 'FREE' || card.numbers[col][row] === 'Free') && styles.freeCell
                  ]}
                >
                  <Text style={[
                    styles.numberText,
                    (card.numbers[col][row] === 'FREE' || card.numbers[col][row] === 'Free') && styles.freeText
                  ]}>
                    {card.numbers[col][row] === 'FREE' || card.numbers[col][row] === 'Free' ? 'F' : card.numbers[col][row]}
                  </Text>
                </View>
              ))}
            </View>
          ))}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>YB Bingo</Text>
        <Text style={styles.menuDots}>⋮</Text>
      </View>
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.cardsContainer}>
          {cards.map(card => renderBingoCard(card))}
        </View>
      </ScrollView>
      
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>
      
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TextInput
              style={styles.textInput}
              placeholder="Cartela 1 - 2600"
              value={newCardName}
              onChangeText={setNewCardName}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.addBtn}
                onPress={addNewCard}
              >
                <Text style={styles.btnText}>Add</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.btnText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2a2a2a',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#000',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  menuDots: {
    color: '#fff',
    fontSize: 20,
  },
  scrollView: {
    flex: 1,
  },
  cardsContainer: {
    padding: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: (width - 30) / 2,
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 10,
    overflow: 'hidden',
  },
  expandedCard: {
    width: width - 20,
    alignSelf: 'center',
  },
  cardHeader: {
    backgroundColor: '#8B5CF6',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  cardTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  redDot: {
    width: 8,
    height: 8,
    backgroundColor: '#EF4444',
    borderRadius: 4,
  },
  bingoGrid: {
    padding: 5,
  },
  headerRow: {
    flexDirection: 'row',
    backgroundColor: '#000',
  },
  headerCell: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fff',
  },
  headerText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  numberRow: {
    flexDirection: 'row',
  },
  numberCell: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fff',
  },
  freeCell: {
    backgroundColor: '#EF4444',
  },
  numberText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000',
  },
  freeText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  addButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 60,
    height: 60,
    backgroundColor: '#000',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 30,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    width: width - 40,
    alignItems: 'center',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 15,
    width: '100%',
    marginBottom: 20,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  addBtn: {
    backgroundColor: '#000',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
  },
  cancelBtn: {
    backgroundColor: '#000',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
  },
  btnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default App;