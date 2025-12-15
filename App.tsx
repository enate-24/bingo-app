import React, {useState, useEffect} from 'react';
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
  Platform,
} from 'react-native';
// Simple storage wrapper that works on all platforms
const Storage = {
  setItem: async (key: string, value: string) => {
    try {
      if (Platform.OS === 'web') {
        localStorage.setItem(key, value);
      } else {
        // For now, just use in-memory storage for mobile until AsyncStorage is properly configured
        console.log('Would save to AsyncStorage:', key, value);
      }
    } catch (error) {
      console.error('Storage setItem error:', error);
    }
  },
  getItem: async (key: string) => {
    try {
      if (Platform.OS === 'web') {
        return localStorage.getItem(key);
      } else {
        // For now, return null for mobile until AsyncStorage is properly configured
        console.log('Would load from AsyncStorage:', key);
        return null;
      }
    } catch (error) {
      console.error('Storage getItem error:', error);
      return null;
    }
  },
  removeItem: async (key: string) => {
    try {
      if (Platform.OS === 'web') {
        localStorage.removeItem(key);
      } else {
        // For now, just log for mobile until AsyncStorage is properly configured
        console.log('Would remove from AsyncStorage:', key);
      }
    } catch (error) {
      console.error('Storage removeItem error:', error);
    }
  }
};
// Import cartela data with error handling
let bingoCards: {[key: number]: (number | string)[][]} = {};
try {
  const cartelaModule = require('./cartela.js');
  bingoCards = cartelaModule.bingoCards || {};
} catch (error) {
  console.error('Failed to load cartela data:', error);
  // Fallback data
  bingoCards = {
    1: [
      [8, 19, 37, 59, 75],
      [3, 29, 42, 54, 68],
      [13, 28, "FREE", 60, 71],
      [6, 26, 32, 58, 64],
      [2, 18, 40, 48, 70],
    ]
  };
}

const {width, height} = Dimensions.get('window');
const isTablet = width > 768;
const isLandscape = width > height;

interface BingoCard {
  id: number;
  name: string;
  numbers: (number | string)[][];
  expanded: boolean;
  markedCells: boolean[][];
}

// Convert cartela format to our app format
const convertCartelaToNumbers = (cartelaData: (number | string)[][]): (number | string)[][] => {
  // cartela.js has data in [row][col] format, we need [col][row] format
  const converted: (number | string)[][] = [[], [], [], [], []];
  
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 5; col++) {
      converted[col][row] = cartelaData[row][col];
    }
  }
  
  return converted;
};

const getCartelaById = (id: number): (number | string)[][] => {
  try {
    const cartelaData = bingoCards[id];
    if (!cartelaData) {
      // Fallback to card 1 if ID not found
      const fallbackData = bingoCards[1];
      if (!fallbackData) {
        // Ultimate fallback
        return [
          [8, 3, 13, 6, 2],
          [19, 29, 28, 26, 18],
          [37, 42, "FREE", 32, 40],
          [59, 54, 60, 58, 48],
          [75, 68, 71, 64, 70]
        ];
      }
      return convertCartelaToNumbers(fallbackData);
    }
    return convertCartelaToNumbers(cartelaData);
  } catch (error) {
    console.error('Error getting cartela by ID:', error);
    // Return a safe fallback
    return [
      [8, 3, 13, 6, 2],
      [19, 29, 28, 26, 18],
      [37, 42, "FREE", 32, 40],
      [59, 54, 60, 58, 48],
      [75, 68, 71, 64, 70]
    ];
  }
};

const STORAGE_KEY = '@abisinya_bingo_data';

const App = (): JSX.Element => {
  const createEmptyMarkedCells = (): boolean[][] => {
    return Array(5).fill(null).map(() => Array(5).fill(false));
  };

  // Save data to storage
  const saveData = async (cardsData: BingoCard[]) => {
    try {
      await Storage.setItem(STORAGE_KEY, JSON.stringify(cardsData));
      console.log('Data saved successfully');
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };

  // Load data from storage
  const loadData = async () => {
    try {
      const savedData = await Storage.getItem(STORAGE_KEY);
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        console.log('Data loaded successfully');
        return parsedData;
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
    return null;
  };

  // Clear data from storage
  const clearStoredData = async () => {
    try {
      await Storage.removeItem(STORAGE_KEY);
      console.log('Stored data cleared');
    } catch (error) {
      console.error('Error clearing data:', error);
    }
  };

  const [cards, setCards] = useState<BingoCard[]>([]);
  
  const [modalVisible, setModalVisible] = useState(false);
  const [cartelaId, setCartelaId] = useState('');
  const [menuVisible, setMenuVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load data on app start
  useEffect(() => {
    const initializeData = async () => {
      const savedData = await loadData();
      if (savedData && savedData.length > 0) {
        setCards(savedData);
      }
      setIsLoading(false);
    };
    initializeData();
  }, []);

  // Save data whenever cards change (except during initial load)
  useEffect(() => {
    if (!isLoading) {
      saveData(cards);
    }
  }, [cards, isLoading]);


  const addNewCard = () => {
    const cardNumber = parseInt(cartelaId);
    if (cardNumber >= 1 && cardNumber <= 2000) {
      const newCard: BingoCard = {
        id: Date.now(),
        name: `Cartela ${cardNumber}`,
        numbers: getCartelaById(cardNumber),
        expanded: false,
        markedCells: createEmptyMarkedCells(),
      };
      setCards([...cards, newCard]);
      setModalVisible(false);
      setCartelaId('');
    }
  };

  const toggleCellMark = (cardId: number, row: number, col: number) => {
    setCards(cards.map(card => {
      if (card.id === cardId) {
        const newMarkedCells = card.markedCells.map((rowCells, r) =>
          rowCells.map((cell, c) => (r === row && c === col) ? !cell : cell)
        );
        return { ...card, markedCells: newMarkedCells };
      }
      return card;
    }));
  };

  const resetCalledNumbers = async () => {
    console.log('Resetting called numbers...');
    const resetCards = cards.map(card => ({
      ...card,
      markedCells: createEmptyMarkedCells()
    }));
    setCards(resetCards);
    setMenuVisible(false);
  };



  const deleteCard = (cardId: number) => {
    setCards(cards.filter(card => card.id !== cardId));
  };

  const renderBingoCard = (card: BingoCard) => {
    const letters = ['B', 'I', 'N', 'G', 'O'];
    
    return (
      <View
        key={card.id}
        style={styles.card}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{card.name}</Text>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => deleteCard(card.id)}
          >
            <Text style={styles.deleteButtonText}>×</Text>
          </TouchableOpacity>
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
              {[0, 1, 2, 3, 4].map(col => {
                const cellValue = card.numbers[col][row];
                const isFree = cellValue === 'FREE' || cellValue === 'Free';
                const isMarked = card.markedCells[row][col];
                
                return (
                  <TouchableOpacity 
                    key={col} 
                    style={[
                      styles.numberCell,
                      (isFree || isMarked) && styles.freeCell
                    ]}
                    onPress={() => {
                      if (!isFree) {
                        toggleCellMark(card.id, row, col);
                      }
                    }}
                    disabled={isFree}
                  >
                    <Text style={[
                      styles.numberText,
                      (isFree || isMarked) && styles.freeText
                    ]}>
                      {isFree ? 'F' : cellValue}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </View>
      </View>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#2563eb" />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading ABISINYA BINGO...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2563eb" />
      
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>ABISINYA BINGO</Text>
        </View>
        
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.addCardButton}
            onPress={() => setModalVisible(true)}
          >
            <Text style={styles.addCardButtonText}>+ Add Card</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => {
              console.log('Menu button pressed, current state:', menuVisible);
              setMenuVisible(!menuVisible);
            }}
          >
            <Text style={styles.menuDots}>⋮</Text>
          </TouchableOpacity>
        </View>
        
        {menuVisible && (
          <>
            <TouchableOpacity
              style={styles.menuBackdrop}
              onPress={() => {
                console.log('Backdrop pressed, closing menu');
                setMenuVisible(false);
              }}
              activeOpacity={1}
            />
            <View style={styles.dropdownMenu}>
              <TouchableOpacity
                style={[styles.menuItem, styles.lastMenuItem]}
                onPress={() => {
                  console.log('Reset called numbers pressed');
                  resetCalledNumbers();
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.menuItemText}>🔄 Reset Called Numbers</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={[
          styles.cardsContainer,
          isTablet && styles.cardsContainerTablet
        ]}>
          {cards.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateTitle}>Welcome to ABISINYA BINGO!</Text>
              <Text style={styles.emptyStateSubtitle}>
                Tap the "+ Add Card" button above to add your first bingo cartela
              </Text>
              <View style={styles.emptyStateIcon}>
                <Text style={styles.emptyStateIconText}>🎯</Text>
              </View>
            </View>
          ) : (
            cards.map(card => renderBingoCard(card))
          )}
        </View>
      </ScrollView>
      
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, isTablet && styles.modalContentTablet]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Enter Cartela ID</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalCloseText}>×</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalBody}>
              <TextInput
                style={styles.textInput}
                placeholder="Enter cartela ID (1-2000)"
                placeholderTextColor="#999"
                value={cartelaId}
                onChangeText={setCartelaId}
                keyboardType="numeric"
                autoFocus={true}
                maxLength={4}
              />
              
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => {
                    setModalVisible(false);
                    setCartelaId('');
                  }}
                >
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.addBtn,
                    (!cartelaId || parseInt(cartelaId) < 1 || parseInt(cartelaId) > 2000) && styles.addBtnDisabled
                  ]}
                  onPress={addNewCard}
                  disabled={!cartelaId || parseInt(cartelaId) < 1 || parseInt(cartelaId) > 2000}
                >
                  <Text style={styles.addBtnText}>Add Cartela</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const getCardWidth = () => {
  if (isTablet) {
    return isLandscape ? (width - 60) / 4 : (width - 50) / 3;
  }
  return (width - 30) / 2;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eff6ff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2563eb',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
    width: '100%',
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2563eb',
    textAlign: 'center',
    marginBottom: 12,
  },
  emptyStateSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  emptyStateIcon: {
    width: 80,
    height: 80,
    backgroundColor: '#eff6ff',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#dbeafe',
  },
  emptyStateIconText: {
    fontSize: 40,
  },
  header: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 16,
    paddingVertical: 10,
    paddingTop: Platform.OS === 'ios' ? 10 : 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'relative',
    zIndex: 100,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  addCardButton: {
    backgroundColor: '#1d4ed8',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#1d4ed8',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  addCardButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  menuButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuDots: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  dropdownMenu: {
    position: 'absolute',
    top: 50,
    right: 0,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    minWidth: 180,
    marginTop: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
    zIndex: 1001,
    overflow: 'hidden',
  },
  menuItem: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    backgroundColor: '#ffffff',
  },
  lastMenuItem: {
    borderBottomWidth: 0,
  },
  menuItemText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  menuBackdrop: {
    position: 'absolute',
    top: 0,
    left: -1000,
    right: -1000,
    bottom: -1000,
    zIndex: 1000,
    backgroundColor: 'transparent',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  cardsContainer: {
    padding: 15,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  cardsContainerTablet: {
    paddingHorizontal: 30,
  },
  card: {
    width: getCardWidth(),
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  cardHeader: {
    backgroundColor: '#2563eb',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  cardTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  deleteButton: {
    width: 28,
    height: 28,
    backgroundColor: 'rgba(239, 68, 68, 0.9)',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  deleteButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 18,
  },
  bingoGrid: {
    padding: 4,
  },
  headerRow: {
    flexDirection: 'row',
    backgroundColor: '#1e40af',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    overflow: 'hidden',
  },
  headerCell: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: 'rgba(255,255,255,0.1)',
  },
  headerText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14,
    letterSpacing: 1,
  },
  numberRow: {
    flexDirection: 'row',
  },
  numberCell: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#ffffff',
  },
  freeCell: {
    backgroundColor: '#ef4444',
  },
  numberText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  freeText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 12,
  },


  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    width: '100%',
    maxWidth: 400,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  modalContentTablet: {
    maxWidth: 500,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#6b7280',
  },
  modalBody: {
    padding: 24,
  },

  textInput: {
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 16,
    fontSize: 18,
    color: '#1f2937',
    backgroundColor: '#f9fafb',
    marginBottom: 24,
    textAlign: 'center',
    fontWeight: '600',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelBtnText: {
    color: '#6b7280',
    fontWeight: '600',
    fontSize: 16,
  },
  addBtn: {
    flex: 1,
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#2563eb',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  addBtnText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 16,
  },
  addBtnDisabled: {
    backgroundColor: '#9ca3af',
    ...Platform.select({
      ios: {
        shadowColor: 'transparent',
      },
      android: {
        elevation: 0,
      },
    }),
  },
});

export default App;