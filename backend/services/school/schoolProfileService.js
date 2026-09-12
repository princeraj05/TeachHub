// backend/services/school/schoolProfileService.js

const calculateCompletionBreakdown = (s) => {
  if (!s) {
    return { basicInformation: 0, mediaPrincipal: 0, admissionSettings: 0, description: 0, total: 0 };
  }

  const isBasicFilled = Boolean(
    (s.email && s.email.trim()) ||
    (s.phoneNumber && s.phoneNumber.trim()) ||
    (s.address && s.address.trim()) ||
    (s.affiliation && s.affiliation.trim()) ||
    (s.code && s.code.trim()) ||
    (s.established && s.established.trim())
  );

  const isMediaFilled = Boolean(
    (s.principalName && s.principalName.trim()) ||
    (s.principalEmail && s.principalEmail.trim()) ||
    (s.principalPhone && s.principalPhone.trim()) ||
    (s.principalPhoto && s.principalPhoto.trim()) ||
    (s.coverImage && s.coverImage.trim()) ||
    (s.schoolPhotos && s.schoolPhotos.length > 0)
  );

  const isAdmissionFilled = Boolean(
    (s.workingDays && s.workingDays.length > 0) ||
    (s.openingTime && s.openingTime.trim()) ||
    (s.closingTime && s.closingTime.trim()) ||
    (s.schoolBoardType && s.schoolBoardType.trim()) ||
    (s.admissionProcess && s.admissionProcess.length > 0)
  );

  const isDescriptionFilled = Boolean(
    s.description && s.description.replace(/<[^>]*>/g, "").trim().length > 20
  );

  const basicInformation = isBasicFilled ? 25 : 0;
  const mediaPrincipal = isMediaFilled ? 25 : 0;
  const admissionSettings = isAdmissionFilled ? 25 : 0;
  const description = isDescriptionFilled ? 25 : 0;
  const total = basicInformation + mediaPrincipal + admissionSettings + description;

  return {
    basicInformation,
    mediaPrincipal,
    admissionSettings,
    description,
    total
  };
};

const calculateProfileCompletion = (s) => {
  return calculateCompletionBreakdown(s).total;
};

const normalizeSchoolData = (s) => {
  if (!s) return s;
  const b = s.basicInfo || {};
  const m = s.media || {};
  const p = s.principal || {};
  const a = s.admission || {};
  const av = s.availability || {};

  const getF = (top, nes) => (top !== undefined && top !== null && top !== "" ? top : (nes !== undefined && nes !== null && nes !== "" ? nes : top));

  s.affiliation = getF(s.affiliation, b.affiliation);
  s.academicYear = getF(s.academicYear, b.academicYear);
  s.email = getF(s.email, b.schoolEmail);
  s.medium = getF(s.medium, b.medium);
  s.phoneNumber = getF(s.phoneNumber, b.phoneNumber);
  s.address = getF(s.address, b.schoolAddress);
  s.established = getF(s.established, b.established);
  s.status = getF(s.status, b.schoolStatus || "Active");
  s.schoolType = getF(s.schoolType, b.schoolType);
  s.registrationNumber = getF(s.registrationNumber, b.registrationNumber);
  s.code = getF(s.code, b.schoolCode);
  s.motto = getF(s.motto, b.schoolMotto);
  s.website = getF(s.website, b.website);
  s.photo = getF(s.photo, b.logo);
  s.availableClasses = getF(s.availableClasses, b.availableClasses);
  s.coverImage = getF(s.coverImage, m.coverImage);

  if ((!s.schoolPhotos || s.schoolPhotos.length === 0) && m.schoolPhotos && m.schoolPhotos.length > 0) {
    s.schoolPhotos = m.schoolPhotos;
  }

  s.principalName = getF(s.principalName, p.name);
  s.principalPhoto = getF(s.principalPhoto, p.photo);
  s.principalDesignation = getF(s.principalDesignation, p.designation);
  s.principalEmail = getF(s.principalEmail, p.email);
  s.principalPhone = getF(s.principalPhone, p.phoneNumber);
  s.principalLeadershipSince = getF(s.principalLeadershipSince, p.leadershipSince);
  s.principalIntroduction = getF(s.principalIntroduction, p.introduction);

  if ((!s.schoolCategoriesList || s.schoolCategoriesList.length === 0) && a.categories && a.categories.length > 0) {
    s.schoolCategoriesList = a.categories;
  }
  if ((!s.admissionProcess || s.admissionProcess.length === 0) && a.processes && a.processes.length > 0) {
    s.admissionProcess = a.processes;
  }
  s.schoolBoardType = getF(s.schoolBoardType, a.schoolType);

  if ((!s.workingDays || s.workingDays.length === 0) && av.workingDays && av.workingDays.length > 0) {
    s.workingDays = av.workingDays;
  }
  s.openingTime = getF(s.openingTime, av.openingTime);
  s.closingTime = getF(s.closingTime, av.closingTime);
  s.lunchBreakStartTime = getF(s.lunchBreakStartTime, av.lunchBreakStartTime);
  if ((!s.holidays || s.holidays.length === 0) && av.holidays && av.holidays.length > 0) {
    s.holidays = av.holidays;
  }

  return s;
};

module.exports = {
  calculateCompletionBreakdown,
  calculateProfileCompletion,
  normalizeSchoolData
};
