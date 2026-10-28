
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
} from "react-native";

import { useStudents } from "../context/students-context";
import { Student } from "../data/students";
import FormField from "./form-field";

interface AddStudentFormProps {
  onSubmitSuccess: (student: Student) => void;
}

interface FormData {
  name: string;
  studentId: string;
  department: string;
  bio: string;
  skillsText: string;
}

interface FormErrors {
  name?: string;
  studentId?: string;
  department?: string;
  bio?: string;
}

function validateForm(
  data: FormData,
  students: Student[]
): FormErrors {
  const newErrors: FormErrors = {};

  if (!data.name.trim()) {
    newErrors.name = "Full name is required.";
  }

  const enteredId = data.studentId.trim();

  if (!enteredId) {
    newErrors.studentId = "Student ID is required.";
  } else if (
    students.some(
      (s) => s.studentId.trim() === enteredId
    )
  ) {
    newErrors.studentId = "Student ID already exists";
  }

  if (!data.department.trim()) {
    newErrors.department = "Department is required.";
  }

  if (!data.bio.trim()) {
    newErrors.bio = "Bio is required.";
  }

  return newErrors;
}

export default function AddStudentForm({
  onSubmitSuccess,
}: AddStudentFormProps) {
  const { students } = useStudents();

  const [formData, setFormData] = useState<FormData>({
    name: "",
    studentId: "",
    department: "",
    bio: "",
    skillsText: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitTrigger, setSubmitTrigger] = useState(false);

  const updateField = (
    field: keyof FormData,
    value: string
  ) => {
    setFormData((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const markTouched = (field: string) => {
    setTouched((previous) => ({
      ...previous,
      [field]: true,
    }));
  };

  const getFieldError = (
    field: keyof FormErrors
  ) => {
    return touched[field] || submitAttempted
      ? errors[field]
      : undefined;
  };

  // Revalidate when the form or student list changes
  useEffect(() => {
    setErrors(validateForm(formData, students));
  }, [formData, students]);

  const isFormValid =
    formData.name.trim().length > 0 &&
    formData.studentId.trim().length > 0 &&
    formData.department.trim().length > 0 &&
    formData.bio.trim().length > 0 &&
    Object.keys(errors).length === 0;

  const handleSubmitPress = () => {
    setSubmitAttempted(true);

    const validationErrors = validateForm(
      formData,
      students
    );

    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);
    setSubmitTrigger(true);
  };

  // Simulate submission, then notify the parent screen
  useEffect(() => {
    if (!submitTrigger) return;

    const timeoutId = setTimeout(() => {
      const latestErrors = validateForm(
        formData,
        students
      );

      if (Object.keys(latestErrors).length > 0) {
        setErrors(latestErrors);
        setSubmitAttempted(true);
        setIsSubmitting(false);
        setSubmitTrigger(false);
        return;
      }

      const newStudent: Student = {
        id: Date.now().toString(),
        name: formData.name.trim(),
        studentId: formData.studentId.trim(),
        department: formData.department.trim(),
        bio: formData.bio.trim(),
        skills: formData.skillsText
          .split(",")
          .map((skill) => skill.trim())
          .filter((skill) => skill.length > 0),
        avatarUrl:
          "https://i.pravatar.cc/150?u=" +
          Date.now(),
      };

      setSubmitTrigger(false);
      setIsSubmitting(false);

      // Parent adds the student and navigates back
      onSubmitSuccess(newStudent);

      setFormData({
        name: "",
        studentId: "",
        department: "",
        bio: "",
        skillsText: "",
      });

      setErrors({});
      setTouched({});
      setSubmitAttempted(false);
    }, 1500);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [submitTrigger]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.heading}>Add New Student</Text>

      <Text style={styles.description}>
        Enter the student's information to add them
        to the directory.
      </Text>

      <FormField
        label="Full Name"
        value={formData.name}
        onChangeText={(text) =>
          updateField("name", text)
        }
        onBlur={() => markTouched("name")}
        placeholder="Enter full name"
        error={getFieldError("name")}
      />

      <FormField
        label="Student ID"
        value={formData.studentId}
        onChangeText={(text) =>
          updateField("studentId", text)
        }
        onBlur={() => markTouched("studentId")}
        placeholder="Enter student ID"
        autoCapitalize="characters"
        error={getFieldError("studentId")}
      />

      <FormField
        label="Department"
        value={formData.department}
        onChangeText={(text) =>
          updateField("department", text)
        }
        onBlur={() => markTouched("department")}
        placeholder="e.g. Computer Science"
        error={getFieldError("department")}
      />

      <FormField
        label="Bio"
        value={formData.bio}
        onChangeText={(text) =>
          updateField("bio", text)
        }
        onBlur={() => markTouched("bio")}
        placeholder="Write a short bio"
        multiline
        error={getFieldError("bio")}
      />

      <FormField
        label="Skills (optional)"
        value={formData.skillsText}
        onChangeText={(text) =>
          updateField("skillsText", text)
        }
        onBlur={() => markTouched("skillsText")}
        placeholder="e.g. React Native, JavaScript, Python"
      />

      <Text style={styles.helperText}>
        Separate skills with commas.
      </Text>

      <Pressable
        style={[
          styles.button,
          (!isFormValid || isSubmitting) &&
            styles.buttonDisabled,
        ]}
        onPress={handleSubmitPress}
        disabled={!isFormValid || isSubmitting}
      >
        {isSubmitting ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.buttonText}>
            Join Directory
          </Text>
        )}
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 32,
  },
  heading: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 6,
  },
  description: {
    fontSize: 13,
    color: "#64748B",
    marginBottom: 24,
    lineHeight: 19,
  },
  helperText: {
    fontSize: 11,
    color: "#64748B",
    marginTop: -10,
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#0D9488",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
    marginBottom: 32,
  },
  buttonDisabled: {
    backgroundColor: "#CBD5E1",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
});
