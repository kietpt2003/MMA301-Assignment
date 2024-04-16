import { View, Text, Image, ScrollView, Pressable, ToastAndroid } from 'react-native';
import React, { useCallback, useState } from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

const WatchDetail = ({ route }) => {
    const [watch, setWatch] = useState(route?.params?.watch);
    const [feedbacks, setFeedbacks] = useState(route?.params?.watch?.feedbacks != undefined ? route?.params?.watch?.feedbacks : []);
    const [showFullDescription, setShowFullDescription] = useState(false);
    const [isClicked, setClick] = useState(false);
    const [isSortByRating, setSortByRating] = useState(true);
    const [isSortByDate, setSortByDate] = useState(true);

    const toggleFavorite = async () => {
        setWatch(prevState => ({
            ...prevState,
            isFavo: !watch.isFavo
        }));
        const favoArr = await getData();
        await storeData(favoArr);
        setClick(!isClicked);
    };

    // Function to toggle show more/show less
    const toggleDescription = () => {
        setShowFullDescription(!showFullDescription);
    };

    const storeData = async (myFavoArr) => {
        try {
            if (myFavoArr.length != 0) {
                for (let i = 0; i < myFavoArr.length; i++) {
                    if (myFavoArr[i].id == watch.id) {
                        myFavoArr[i].isFavo = !myFavoArr[i].isFavo
                    }
                }
            }
            const jsonValue = JSON.stringify(myFavoArr);
            await AsyncStorage.setItem('my-key', jsonValue);
        } catch (e) {
            // saving error
            console.log("Saving err: ", e);
        }
    };

    const getData = async () => {
        try {
            const value = await AsyncStorage.getItem('my-key');
            if (value !== null) {
                // value previously stored
                return JSON.parse(value);
            }
            return []
        } catch (e) {
            // error reading value
            console.log("Reading err: ", e);
        }
    };

    // Calculate the description to display based on showFullDescription state
    const displayedDescription = showFullDescription ? watch.description : watch.description?.slice(0, 100) + "...";

    const getRatingCount = (feedbacks, rating) => {
        if (feedbacks.length == undefined || feedbacks?.length === 0) {
            return 0; // Trả về 0 nếu không có đánh giá nào
        }
        return feedbacks.filter(feedback => feedback.rating === rating)?.length;
    };

    const getRatingPercentage = (feedbacks, rating) => {
        if (feedbacks.length == undefined || feedbacks?.length === 0) {
            return 0; // Trả về 0 nếu không có đánh giá nào
        }
        const totalFeedbacks = feedbacks?.length ? feedbacks?.length : 0;
        const ratingCount = feedbacks.filter(feedback => feedback.rating === rating)?.length;
        if (totalFeedbacks === 0) {
            return 0;
        }
        return (ratingCount / totalFeedbacks) * 100;
    };

    const calculateAverageRating = (feedbacks) => {
        if (!feedbacks || feedbacks?.length === 0) {
            return 0; // Trả về 0 nếu không có đánh giá nào
        }

        const totalRating = feedbacks.reduce((accumulator, feedback) => accumulator + feedback.rating, 0);
        const averageRating = totalRating / feedbacks?.length;
        return averageRating.toFixed(1);
    };

    const getFirstCharacterOfLastName = (author) => {
        if (!author) return ''; // Handle case when author is not provided
        const lastName = author.trim().split(' ').pop(); // Get the last word (presumed to be the last name)
        return lastName.charAt(0).toUpperCase(); // Return the first character of the last name in uppercase
    };

    const renderStars = (rating) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            if (i <= rating) {
                stars.push(<MaterialIcons key={i} name="star" size={20} color={"#FFC300"} />);
            } else {
                stars.push(<MaterialIcons key={i} name="star" size={20} color={"grey"} />);
            }
        }
        return stars;
    };

    const convertDate = (dateString) => {
        const date = new Date(dateString);
        const formattedDate = date.toISOString().split('T')[0];
        return formattedDate;
    };

    function sortFeedbacks(feedbacks, sortByRating, sortByDate) {
        let sortedFeedbacks = [...feedbacks];

        // Group feedbacks by rating
        let groupedByRating = {};
        sortedFeedbacks.forEach(feedback => {
            if (!groupedByRating[feedback.rating]) {
                groupedByRating[feedback.rating] = [];
            }
            groupedByRating[feedback.rating].push(feedback);
        });

        // Sort feedbacks within each rating group by date
        for (let rating in groupedByRating) {
            groupedByRating[rating].sort((a, b) => {
                if (sortByDate) {
                    return new Date(b.date) - new Date(a.date)
                } else {
                    return new Date(a.date) - new Date(b.date)
                }
            });
        }

        // Push sorted feedbacks into a single array
        let separatedByRating = [];
        if (sortByRating) {
            for (let rating = 5; rating >= 1; rating--) {
                if (groupedByRating[rating]) {
                    separatedByRating.push(...groupedByRating[rating]);
                }
            }
        } else {
            for (let rating = 1; rating <= 5; rating++) {
                if (groupedByRating[rating]) {
                    separatedByRating.push(...groupedByRating[rating]);
                }
            }
        }

        return separatedByRating;
    }

    const handleFilterFeedbacks = (feedbacks) => {
        const newFeedbacksArr = sortFeedbacks(feedbacks, isSortByRating, isSortByDate);
        setFeedbacks(newFeedbacksArr);
    }

    const changeStateSortByRating = () => {
        setSortByRating(!isSortByRating);
    }

    const changeStateSortByDate = () => {
        setSortByDate(!isSortByDate);
    }

    const showToast = (isFavo) => {
        const message = isFavo ? "Removed from favorites" : "Added to favorites";
        ToastAndroid.show(message, ToastAndroid.CENTER);
    };

    useFocusEffect(
        useCallback(() => {
            getData();
            handleFilterFeedbacks(feedbacks);
        }, [isClicked])
    )

    return (
        <ScrollView>
            <Image
                source={{ uri: watch.image }}
                style={{
                    width: "100%", height: 200,
                    resizeMode: 'contain',
                    backgroundColor: "white",
                }} />
            <View style={{ backgroundColor: "white" }}>
                {/* Brand Title */}
                <View style={{ flexDirection: "row", padding: 10, borderTopColor: "black", borderTopWidth: 1 }}>
                    <Text style={{ flex: 0.7, fontSize: 25, fontWeight: 'bold', textAlignVertical: "center" }}>{watch.watchName}</Text>
                    <Text style={{ flex: 0.2, fontSize: 20, fontWeight: 'bold', color: "red", textAlign: 'center', textAlignVertical: "center" }}>${watch.price}</Text>
                    <View style={{ flex: 0.1, alignItems: 'center', justifyContent: "center" }}>
                        <Pressable
                            onPress={() => { toggleFavorite(); showToast(watch.isFavo); }}
                        >
                            <MaterialIcons name={watch.isFavo ? "favorite" : "favorite-outline"} size={30} color={"red"} />
                        </Pressable>
                    </View>
                </View>
                {/* Brand */}
                <View style={{ flexDirection: "row", padding: 10 }}>
                    <Text style={{ flex: 0.15, fontSize: 15, fontWeight: 'bold' }}>Brand:</Text>
                    <Text style={{ flex: 1, fontSize: 15 }}>{watch.brandName}</Text>
                </View>
                {/* Automatic */}
                <View style={{ flexDirection: "row", padding: 10 }}>
                    <Text style={{ flex: 0.15, fontSize: 15, fontWeight: 'bold' }}>Auto:</Text>
                    <Text style={{ flex: 1, fontSize: 15 }}>{watch.automatic ? "Automatic" : "Non automation"}</Text>
                </View>
                {/* Description */}
                <View style={{ padding: 10 }}>
                    <Text style={{ flex: 0.15, fontSize: 15, fontWeight: 'bold' }}>Decription:</Text>
                    <Text style={{ flex: 1, fontSize: 15 }}>{watch.description ? displayedDescription : "No description"}
                        {
                            watch.description?.length > 100 && ( // Only show the "show more" button if description is longer than 100 characters
                                <Pressable onPress={toggleDescription}>
                                    <Text style={{ fontWeight: 'bold' }}>{showFullDescription ? "Show Less" : "Show More"}</Text>
                                </Pressable>
                            )
                        }
                    </Text>
                </View>
                {/* Ratings */}
                <View style={{ padding: 10 }}>
                    <Text style={{ fontSize: 15, fontWeight: 'bold' }}>Ratings and comments:</Text>
                    <View style={{ flexDirection: 'row' }}>
                        {/* Rating average */}
                        <View style={{ flex: 1, alignItems: 'center', justifyContent: "center" }}>
                            <Text style={{ fontSize: 30, fontWeight: 'bold' }}>{calculateAverageRating(watch.feedbacks)}</Text>
                            <View style={{ flexDirection: 'row' }}>
                                <MaterialIcons name="star" size={20} color={watch?.feedbacks ? "#FFC300" : "grey"} />
                                <MaterialIcons name="star" size={20} color={watch?.feedbacks ? "#FFC300" : "grey"} />
                                <MaterialIcons name="star" size={20} color={watch?.feedbacks ? "#FFC300" : "grey"} />
                                <MaterialIcons name="star" size={20} color={watch?.feedbacks ? "#FFC300" : "grey"} />
                                <MaterialIcons name="star" size={20} color={watch?.feedbacks ? "#FFC300" : "grey"} />
                                <MaterialIcons name="star" size={20} color={watch?.feedbacks ? "#FFC300" : "grey"} />
                            </View>
                            <Text style={{ flex: 0.15, fontSize: 18 }}>{watch.feedbacks?.length ? watch.feedbacks?.length : 0} feedback(s)</Text>
                        </View>
                        <View style={{ borderRightWidth: 1, borderColor: "grey" }} />
                        {/* Rating percentage */}
                        <View style={{ flex: 1, alignItems: 'center' }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 5 }}>
                                <Text>5</Text>
                                <View style={{ flex: 0.5, flexDirection: 'row', alignItems: 'center', marginLeft: 10 }}>
                                    <View style={{ borderBottomLeftRadius: 10, borderTopLeftRadius: 10, backgroundColor: '#FFC300', width: `${getRatingPercentage(watch?.feedbacks ? watch?.feedbacks : [], 5)}%`, height: 20 }} />
                                    <View style={{ borderBottomLeftRadius: watch?.feedbacks ? 0 : 10, borderTopLeftRadius: watch?.feedbacks ? 0 : 10, borderBottomRightRadius: 10, borderTopRightRadius: 10, backgroundColor: 'grey', width: `${100 - getRatingPercentage(watch?.feedbacks ? watch?.feedbacks : [], 5)}%`, height: 20 }} />
                                </View>
                            </View>
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 5 }}>
                                <Text>4</Text>
                                <View style={{ flex: 0.5, flexDirection: 'row', alignItems: 'center', marginLeft: 10 }}>
                                    <View style={{ borderBottomLeftRadius: 10, borderTopLeftRadius: 10, backgroundColor: '#FFC300', width: `${getRatingPercentage(watch?.feedbacks ? watch?.feedbacks : [], 4)}%`, height: 20 }} />
                                    <View style={{ borderBottomLeftRadius: watch?.feedbacks ? 0 : 10, borderTopLeftRadius: watch?.feedbacks ? 0 : 10, borderBottomRightRadius: 10, borderTopRightRadius: 10, backgroundColor: 'grey', width: `${100 - getRatingPercentage(watch?.feedbacks ? watch?.feedbacks : [], 4)}%`, height: 20 }} />
                                </View>
                            </View>
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 5 }}>
                                <Text>3</Text>
                                <View style={{ flex: 0.5, flexDirection: 'row', alignItems: 'center', marginLeft: 10 }}>
                                    <View style={{ borderBottomLeftRadius: 10, borderTopLeftRadius: 10, backgroundColor: '#FFC300', width: `${getRatingPercentage(watch?.feedbacks ? watch?.feedbacks : [], 3)}%`, height: 20 }} />
                                    <View style={{ borderBottomLeftRadius: watch?.feedbacks ? 0 : 10, borderTopLeftRadius: watch?.feedbacks ? 0 : 10, borderBottomRightRadius: 10, borderTopRightRadius: 10, backgroundColor: 'grey', width: `${100 - getRatingPercentage(watch?.feedbacks ? watch?.feedbacks : [], 3)}%`, height: 20 }} />
                                </View>
                            </View>
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 5 }}>
                                <Text>2</Text>
                                <View style={{ flex: 0.5, flexDirection: 'row', alignItems: 'center', marginLeft: 10 }}>
                                    <View style={{ borderBottomLeftRadius: 10, borderTopLeftRadius: 10, backgroundColor: '#FFC300', width: `${getRatingPercentage(watch?.feedbacks ? watch?.feedbacks : [], 2)}%`, height: 20 }} />
                                    <View style={{ borderBottomLeftRadius: watch?.feedbacks ? 0 : 10, borderTopLeftRadius: watch?.feedbacks ? 0 : 10, borderBottomRightRadius: 10, borderTopRightRadius: 10, backgroundColor: 'grey', width: `${100 - getRatingPercentage(watch?.feedbacks ? watch?.feedbacks : [], 2)}%`, height: 20 }} />
                                </View>
                            </View>
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 5 }}>
                                <Text>1</Text>
                                <View style={{ flex: 0.5, flexDirection: 'row', alignItems: 'center', marginLeft: 10 }}>
                                    <View style={{ borderBottomLeftRadius: 10, borderTopLeftRadius: 10, backgroundColor: '#FFC300', width: `${getRatingPercentage(watch?.feedbacks ? watch?.feedbacks : [], 1)}%`, height: 20 }} />
                                    <View style={{ borderBottomLeftRadius: watch?.feedbacks ? 0 : 10, borderTopLeftRadius: watch?.feedbacks ? 0 : 10, borderBottomRightRadius: 10, borderTopRightRadius: 10, backgroundColor: 'grey', width: `${100 - getRatingPercentage(watch?.feedbacks ? watch?.feedbacks : [], 1)}%`, height: 20 }} />
                                </View>
                            </View>
                        </View>
                    </View>
                </View>
                {/* Filter */}
                {
                    feedbacks.length != 0 &&
                    <View style={{ flex: 1, flexDirection: "row", justifyContent: "space-around" }}>
                        <Pressable
                            style={{ flex: 0.34, borderRadius: 30, backgroundColor: `${isSortByRating ? "#00FFFF" : "#C0C0C0"}`, alignItems: "center", justifyContent: "center", height: 30 }}
                            onPress={() => {
                                changeStateSortByRating();
                                setClick(!isClicked);
                            }}
                        >
                            <Text style={{ textAlign: "center", textAlignVertical: "center", fontWeight: "bold" }} >Short by rating</Text>
                        </Pressable>
                        <Pressable
                            style={{ flex: 0.34, borderRadius: 30, backgroundColor: `${isSortByDate ? "#00FFFF" : "#C0C0C0"}`, alignItems: "center", justifyContent: "center", height: 30 }}
                            onPress={() => {
                                changeStateSortByDate();
                                setClick(!isClicked);
                            }}
                        >
                            <Text style={{ textAlign: "center", textAlignVertical: "center", fontWeight: "bold" }} >Short by date</Text>
                        </Pressable>
                    </View>
                }
                {/* Comments */}
                <View style={{ padding: 10 }}>
                    {
                        feedbacks.map((feedback, index) => (
                            <React.Fragment key={index}>
                                <View style={{ flex: 1, flexDirection: "row", marginTop: index === 0 ? 0 : 15 }}>
                                    {/* Avatar */}
                                    <View style={{ borderRadius: 30, backgroundColor: "#00FFFF", width: 30, height: 30 }}>
                                        <Text style={{ flex: 1, fontSize: 15, textAlignVertical: "center", textAlign: "center" }}>{getFirstCharacterOfLastName(feedback.author)}</Text>
                                    </View>
                                    {/* Author name */}
                                    <Text style={{ flex: 1, fontSize: 15, textAlignVertical: "center", marginLeft: 5 }}>{feedback.author}</Text>
                                </View>
                                <View style={{ flexDirection: 'row' }}>
                                    {renderStars(feedback.rating)}
                                    <Text style={{ flex: 1, fontSize: 15, textAlignVertical: "center", marginLeft: 5 }}>{convertDate(feedback.date)}</Text>
                                </View>
                                <Text style={{ flex: 1, fontSize: 15, textAlignVertical: "center", marginLeft: 5 }}>{feedback.comment}</Text>
                            </React.Fragment>
                        ))
                    }
                    {
                        feedbacks.length == 0 && <Text style={{ flex: 1, fontSize: 15, textAlignVertical: "center", marginLeft: 5 }}>No comment</Text>
                    }
                </View>
            </View>
        </ScrollView >
    )
}

export default WatchDetail
