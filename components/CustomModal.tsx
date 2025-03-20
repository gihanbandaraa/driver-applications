import { View, Text, Modal, Pressable, StyleSheet,Image } from 'react-native';
import React from 'react';
import CustomButton from './CustomButton';
import { ImageSourcePropType } from 'react-native';

interface CustomModalProps {
    visible: boolean;
    onClose: () => void;
    title: string;
    content: string;
    image?: ImageSourcePropType;
}

const CustomModal: React.FC<CustomModalProps> = ({ visible, onClose, title, content,image }) => {
    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.modalContainer}>


                    {/* Modal Title */}
                    <Text style={styles.title}>{title}</Text>

                    {/* Modal Image */}
                    {image && <Image source={image} style={{ width: 250, height: 150  }}   resizeMode="contain" />}

                    {/* Modal Content */}
                    <Text style={styles.content}>{content}</Text>

                    {/* Close Button */}
                    <CustomButton title="I Agree" onPress={onClose} />
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
    },
    modalContainer: {
        width: '90%',
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        alignItems: 'center',
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#007bff', // Blue color
        marginBottom: 10,
    },
    content: {
        marginTop: 20,
        fontSize: 16,
        color: '#333', // Dark gray
        textAlign: 'center',
        marginBottom: 20,
        lineHeight: 30,
    },
});

export default CustomModal;
