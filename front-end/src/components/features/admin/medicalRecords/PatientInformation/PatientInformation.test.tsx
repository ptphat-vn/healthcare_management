import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import PatientInformation from "./PatientInformation";

describe("PatientInformation component", () => {
  const mockPatient = {
    id: "P001",
    fullName: "Nguyễn Văn A",
    email: "nguyenvana@example.com",
    dateOfBirth: "1990-01-15",
    gender: "Nam",
    phone: "0123456789",
    address: "123 Đường ABC, Quận 1, TP.HCM",
  };

  it("renders without crashing", () => {
    render(<PatientInformation patient={mockPatient} />);
    expect(screen.getByText("Patient Information")).toBeInTheDocument();
  });

  it("displays patient ID correctly", () => {
    render(<PatientInformation patient={mockPatient} />);
    expect(screen.getByText("Patient ID:")).toBeInTheDocument();
    expect(screen.getByText("#P001")).toBeInTheDocument();
  });

  it("displays full name correctly", () => {
    render(<PatientInformation patient={mockPatient} />);
    expect(screen.getByText("Full Name:")).toBeInTheDocument();
    expect(screen.getByText("Nguyễn Văn A")).toBeInTheDocument();
  });

  it("displays email as a clickable mailto link", () => {
    render(<PatientInformation patient={mockPatient} />);
    const emailLink = screen.getByText("nguyenvana@example.com");
    expect(emailLink).toBeInTheDocument();
    expect(emailLink.closest("a")).toHaveAttribute(
      "href",
      "mailto:nguyenvana@example.com"
    );
  });

  it("displays date of birth correctly", () => {
    render(<PatientInformation patient={mockPatient} />);
    expect(screen.getByText("Date of Birth:")).toBeInTheDocument();
    expect(screen.getByText("1990-01-15")).toBeInTheDocument();
  });

  it("displays gender correctly", () => {
    render(<PatientInformation patient={mockPatient} />);
    expect(screen.getByText("Gender:")).toBeInTheDocument();
    expect(screen.getByText("Nam")).toBeInTheDocument();
  });

  it("displays phone number correctly", () => {
    render(<PatientInformation patient={mockPatient} />);
    expect(screen.getByText("Phone:")).toBeInTheDocument();
    expect(screen.getByText("0123456789")).toBeInTheDocument();
  });

  it("displays address correctly", () => {
    render(<PatientInformation patient={mockPatient} />);
    expect(screen.getByText("Address:")).toBeInTheDocument();
    expect(
      screen.getByText("123 Đường ABC, Quận 1, TP.HCM")
    ).toBeInTheDocument();
  });

  it("displays header with icon and title", () => {
    render(<PatientInformation patient={mockPatient} />);
    const header = screen.getByText("Patient Information");
    expect(header).toBeInTheDocument();
    expect(header.tagName).toBe("H2");
  });

  it("renders all patient information fields", () => {
    render(<PatientInformation patient={mockPatient} />);

    // Check all labels are present
    expect(screen.getByText("Patient ID:")).toBeInTheDocument();
    expect(screen.getByText("Full Name:")).toBeInTheDocument();
    expect(screen.getByText("Email:")).toBeInTheDocument();
    expect(screen.getByText("Date of Birth:")).toBeInTheDocument();
    expect(screen.getByText("Gender:")).toBeInTheDocument();
    expect(screen.getByText("Phone:")).toBeInTheDocument();
    expect(screen.getByText("Address:")).toBeInTheDocument();
  });

  it("handles different patient data correctly", () => {
    const differentPatient = {
      id: "P999",
      fullName: "Trần Thị B",
      email: "tranthib@example.com",
      dateOfBirth: "1985-05-20",
      gender: "Nữ",
      phone: "0987654321",
      address: "456 Đường XYZ, Quận 2, TP.HCM",
    };

    render(<PatientInformation patient={differentPatient} />);

    expect(screen.getByText("#P999")).toBeInTheDocument();
    expect(screen.getByText("Trần Thị B")).toBeInTheDocument();
    expect(screen.getByText("tranthib@example.com")).toBeInTheDocument();
    expect(screen.getByText("1985-05-20")).toBeInTheDocument();
    expect(screen.getByText("Nữ")).toBeInTheDocument();
    expect(screen.getByText("0987654321")).toBeInTheDocument();
    expect(
      screen.getByText("456 Đường XYZ, Quận 2, TP.HCM")
    ).toBeInTheDocument();
  });

  it("has correct email link styling classes", () => {
    render(<PatientInformation patient={mockPatient} />);
    const emailLink = screen.getByText("nguyenvana@example.com").closest("a");
    expect(emailLink).toHaveClass("text-blue-600");
    expect(emailLink).toHaveClass("hover:text-blue-800");
    expect(emailLink).toHaveClass("underline");
  });
});
