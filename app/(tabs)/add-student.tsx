
import { router } from "expo-router";
import { SafeAreaView, StyleSheet } from "react-native";

import AddStudentForm from "../../components/add-student-form";
import { useStudents } from "../../context/students-context";
import { Student } from "../../data/students";

export default function AddStudentScreen() {
  const { dispatch } = useStudents();

  const handleSubmitSuccess = (student: Student) => {
    dispatch({
      type: "ADD_STUDENT",
      payload: student,
    });

    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <AddStudentForm
        onSubmitSuccess={handleSubmitSuccess}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0F4F8",
  },
});
