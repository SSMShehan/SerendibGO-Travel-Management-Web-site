const asyncHandler = require('express-async-handler');
const puppeteer = require('puppeteer');
const User = require('../../models/User');
const Hotel = require('../../models/hotels/Hotel');
const HotelBooking = require('../../models/hotels/HotelBooking');

// @desc    Generate PDF report
// @route   POST /api/admin/reports/generate
// @access  Private (Admin only)
const generatePDFReport = asyncHandler(async (req, res) => {
  try {
    const { reportType = 'dashboard', period = '30d' } = req.body;
    
    console.log('Generating PDF report:', { reportType, period });
    
    // Use mock data for testing when database is not available
    let reportData;
    try {
      if (reportType === 'users') {
        reportData = await fetchUserReportData(period);
      } else if (reportType === 'staff') {
        reportData = await fetchStaffReportData(period);
      } else if (reportType === 'payroll') {
        reportData = await fetchPayrollReportData(period);
      } else if (reportType === 'permissions') {
        reportData = await fetchPermissionsReportData(period);
      } else if (reportType === 'analytics') {
        reportData = await fetchAnalyticsReportData(period);
      } else {
        reportData = await fetchReportData(period);
      }
    } catch (dbError) {
      console.log('Database not available, using mock data:', dbError.message);
      // Mock data for testing
      if (reportType === 'users') {
        reportData = {
          period,
          startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          endDate: new Date(),
          overview: {
            totalUsers: 30,
            verifiedUsers: 19,
            pendingUsers: 11,
            tourists: 15,
            hotelOwners: 8,
            guides: 4,
            drivers: 2,
            staff: 1
          },
          recent: {
            recentUsers: 5,
            recentVerifications: 3
          },
          users: [
            { name: 'John Doe', email: 'john@example.com', role: 'tourist', status: 'verified', joined: '2024-01-15' },
            { name: 'Jane Smith', email: 'jane@example.com', role: 'hotel_owner', status: 'verified', joined: '2024-01-10' },
            { name: 'Mike Johnson', email: 'mike@example.com', role: 'guide', status: 'pending', joined: '2024-01-20' },
            { name: 'Sarah Wilson', email: 'sarah@example.com', role: 'tourist', status: 'verified', joined: '2024-01-18' },
            { name: 'David Brown', email: 'david@example.com', role: 'driver', status: 'pending', joined: '2024-01-22' }
          ]
        };
      } else if (reportType === 'staff') {
        reportData = {
          period,
          startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          endDate: new Date(),
          overview: {
            totalStaff: 3,
            activeStaff: 3,
            pendingStaff: 0,
            inactiveStaff: 0,
            managers: 1,
            supervisors: 1,
            regularStaff: 1
          },
          recent: {
            recentStaff: 2,
            recentActivations: 1
          },
          staff: [
            { name: 'Sadun Staff', email: 'sadunstaff@serandibgo.com', phone: '+94771234569', role: 'manager', status: 'active', joined: '2024-01-15' },
            { name: 'Autor Created', email: 'staff@gmail.com', phone: '+0000000000', role: 'supervisor', status: 'active', joined: '2024-01-10' },
            { name: 'John Manager', email: 'john@serandibgo.com', phone: '+94771234570', role: 'staff', status: 'active', joined: '2024-01-20' }
          ]
        };
      } else if (reportType === 'payroll') {
        reportData = {
          period,
          startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          endDate: new Date(),
          overview: {
            totalStaff: 3,
            paidStaff: 2,
            pendingStaff: 1,
            totalPayroll: 157500,
            averageSalary: 52500,
            totalAllowances: 15000,
            totalDeductions: 5000
          },
          recent: {
            recentPayments: 2,
            pendingPayments: 1
          },
          payroll: [
            { 
              staffName: 'Sadun Staff', 
              position: 'Manager', 
              baseSalary: 75000, 
              allowances: 10000, 
              deductions: 2000, 
              netSalary: 83000, 
              status: 'paid', 
              payPeriod: '2024-01',
              paymentDate: '2024-01-31'
            },
            { 
              staffName: 'Autor Created', 
              position: 'Supervisor', 
              baseSalary: 50000, 
              allowances: 5000, 
              deductions: 1500, 
              netSalary: 53500, 
              status: 'paid', 
              payPeriod: '2024-01',
              paymentDate: '2024-01-31'
            },
            { 
              staffName: 'John Manager', 
              position: 'Staff', 
              baseSalary: 40000, 
              allowances: 3000, 
              deductions: 1000, 
              netSalary: 42000, 
              status: 'pending', 
              payPeriod: '2024-01',
              paymentDate: null
            }
          ]
        };
      } else if (reportType === 'permissions') {
        reportData = {
          period,
          startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          endDate: new Date(),
          overview: {
            totalTemplates: 2,
            totalStaff: 3,
            managersWithFullAccess: 1,
            staffWithLimitedAccess: 2,
            totalPermissions: 24,
            activePermissions: 18
          },
          recent: {
            recentTemplateUpdates: 1,
            recentPermissionChanges: 3
          },
          templates: [
            {
              name: 'Manager Template',
              description: 'Full access to all modules and features',
              permissions: {
                users: { view: true, create: true, edit: true, delete: true },
                bookings: { view: true, create: true, edit: true, delete: true },
                vehicles: { view: true, create: true, edit: true, delete: true },
                reports: { view: true, create: true, edit: true, delete: true }
              },
              staffCount: 1
            },
            {
              name: 'Staff Template',
              description: 'Limited access for general staff operations',
              permissions: {
                users: { view: true, create: false, edit: false, delete: false },
                bookings: { view: true, create: false, edit: true, delete: false },
                vehicles: { view: true, create: true, edit: false, delete: false },
                reports: { view: true, create: false, edit: false, delete: false }
              },
              staffCount: 2
            }
          ],
          staffPermissions: [
            {
              staffName: 'Sadun Staff',
              role: 'Manager',
              template: 'Manager Template',
              permissions: {
                users: { view: true, create: true, edit: true, delete: true },
                bookings: { view: true, create: true, edit: true, delete: true },
                vehicles: { view: true, create: true, edit: true, delete: true },
                reports: { view: true, create: true, edit: true, delete: true }
              }
            },
            {
              staffName: 'Autor Created',
              role: 'Supervisor',
              template: 'Staff Template',
              permissions: {
                users: { view: true, create: false, edit: false, delete: false },
                bookings: { view: true, create: false, edit: true, delete: false },
                vehicles: { view: true, create: true, edit: false, delete: false },
                reports: { view: true, create: false, edit: false, delete: false }
              }
            },
            {
              staffName: 'John Manager',
              role: 'Staff',
              template: 'Staff Template',
              permissions: {
                users: { view: true, create: false, edit: false, delete: false },
                bookings: { view: true, create: false, edit: true, delete: false },
                vehicles: { view: true, create: true, edit: false, delete: false },
                reports: { view: true, create: false, edit: false, delete: false }
              }
            }
          ]
        };
      } else if (reportType === 'analytics') {
        reportData = {
          period,
          startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          endDate: new Date(),
          overview: {
            newUsers: 18,
            avgActiveUsers: 12,
            totalBookings: 4,
            totalRevenue: 0,
            userGrowth: 12.5,
            activeUserGrowth: 12.5,
            bookingGrowth: 8.3,
            revenueGrowth: 15.2
          },
          recent: {
            recentUsers: 18,
            recentBookings: 4,
            recentRevenue: 0
          },
          userTrends: [
            { date: '2024-01-01', users: 5 },
            { date: '2024-01-02', users: 8 },
            { date: '2024-01-03', users: 12 },
            { date: '2024-01-04', users: 15 },
            { date: '2024-01-05', users: 18 },
            { date: '2024-01-06', users: 20 },
            { date: '2024-01-07', users: 18 }
          ],
          bookingTrends: [
            { category: 'Tours', count: 2, percentage: 50 },
            { category: 'Hotels', count: 1, percentage: 25 },
            { category: 'Vehicles', count: 1, percentage: 25 }
          ],
          topPerforming: {
            topTours: [
              { name: 'Cultural Heritage Tour', bookings: 2, revenue: 0 },
              { name: 'Nature Adventure', bookings: 1, revenue: 0 }
            ],
            topHotels: [
              { name: 'Colombo City Hotel', bookings: 1, revenue: 0 }
            ],
            topVehicles: [
              { name: 'Luxury Van', bookings: 1, revenue: 0 }
            ]
          }
        };
      } else {
        reportData = {
          period,
          startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          endDate: new Date(),
          overview: {
            totalUsers: 150,
            totalHotels: 25,
            totalBookings: 300,
            totalStaff: 10,
            totalHotelOwners: 20,
            totalGuides: 15,
            totalTourists: 100
          },
          pending: {
            pendingHotels: 5,
            pendingUsers: 8
          },
          recent: {
            recentBookings: 45,
            recentUsers: 12,
            recentHotels: 3
          },
          revenue: {
            totalRevenue: 125000,
            averageBookingValue: 2500
          },
          topHotels: [
            { name: 'Hotel Paradise', location: 'Colombo', totalBookings: 25, totalRevenue: 50000, rating: 4.5 },
            { name: 'Beach Resort', location: 'Galle', totalBookings: 20, totalRevenue: 40000, rating: 4.2 }
          ]
        };
      }
    }
    
    // Generate HTML content for the PDF
    const htmlContent = generateHTMLReport(reportData, reportType);
    
    // Generate PDF using Puppeteer
    const pdfBuffer = await generatePDFFromHTML(htmlContent);
    
    console.log('PDF generated successfully, size:', pdfBuffer.length);
    
    // Convert PDF buffer to base64 for CORS compatibility
    const base64PDF = Buffer.from(pdfBuffer).toString('base64');
    
    console.log('Base64 PDF length:', base64PDF.length);
    console.log('First 100 chars of base64:', base64PDF.substring(0, 100));
    
    res.json({
      success: true,
      data: base64PDF,
      filename: `serendibgo-report-${new Date().toISOString().split('T')[0]}.pdf`
    });
  } catch (error) {
    console.error('Error generating PDF report:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating PDF report',
      error: error.message
    });
  }
});

// Helper function to fetch report data
const fetchReportData = async (period) => {
  // Calculate date range based on period
  let startDate = new Date();
  switch (period) {
    case '7d':
      startDate.setDate(startDate.getDate() - 7);
      break;
    case '30d':
      startDate.setDate(startDate.getDate() - 30);
      break;
    case '90d':
      startDate.setDate(startDate.getDate() - 90);
      break;
    case '1y':
      startDate.setFullYear(startDate.getFullYear() - 1);
      break;
    default:
      startDate.setDate(startDate.getDate() - 30);
  }

  // Get total counts
  const totalUsers = await User.countDocuments();
  const totalHotels = await Hotel.countDocuments();
  const totalBookings = await HotelBooking.countDocuments();
  const totalStaff = await User.countDocuments({ role: 'staff' });
  const totalHotelOwners = await User.countDocuments({ role: 'hotel_owner' });
  const totalGuides = await User.countDocuments({ role: 'guide' });
  const totalTourists = await User.countDocuments({ role: 'tourist' });

  // Get pending approvals
  const pendingHotels = await Hotel.countDocuments({ status: 'pending' });
  const pendingUsers = await User.countDocuments({ isVerified: false });

  // Get recent activity
  const recentBookings = await HotelBooking.countDocuments({
    createdAt: { $gte: startDate }
  });

  const recentUsers = await User.countDocuments({
    createdAt: { $gte: startDate }
  });

  const recentHotels = await Hotel.countDocuments({
    createdAt: { $gte: startDate }
  });

  // Get revenue data
  const revenueData = await HotelBooking.aggregate([
    {
      $match: {
        status: 'confirmed',
        createdAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$totalAmount' },
        averageBookingValue: { $avg: '$totalAmount' }
      }
    }
  ]);

  const totalRevenue = revenueData.length > 0 ? revenueData[0].totalRevenue : 0;
  const averageBookingValue = revenueData.length > 0 ? revenueData[0].averageBookingValue : 0;

  // Get top performing hotels
  const topHotels = await Hotel.aggregate([
    {
      $lookup: {
        from: 'hotelbookings',
        localField: '_id',
        foreignField: 'hotel',
        as: 'bookings'
      }
    },
    {
      $addFields: {
        totalBookings: { $size: '$bookings' },
        totalRevenue: {
          $sum: {
            $map: {
              input: '$bookings',
              as: 'booking',
              in: '$$booking.totalAmount'
            }
          }
        }
      }
    },
    {
      $sort: { totalBookings: -1 }
    },
    {
      $limit: 5
    },
    {
      $project: {
        name: 1,
        location: 1,
        totalBookings: 1,
        totalRevenue: 1,
        rating: 1
      }
    }
  ]);

  return {
    period,
    startDate,
    endDate: new Date(),
    overview: {
      totalUsers,
      totalHotels,
      totalBookings,
      totalStaff,
      totalHotelOwners,
      totalGuides,
      totalTourists
    },
    pending: {
      pendingHotels,
      pendingUsers
    },
    recent: {
      recentBookings,
      recentUsers,
      recentHotels
    },
    revenue: {
      totalRevenue,
      averageBookingValue
    },
    topHotels
  };
};

// Helper function to fetch user report data
const fetchUserReportData = async (period) => {
  // Calculate date range based on period
  let startDate = new Date();
  switch (period) {
    case '7d':
      startDate.setDate(startDate.getDate() - 7);
      break;
    case '30d':
      startDate.setDate(startDate.getDate() - 30);
      break;
    case '90d':
      startDate.setDate(startDate.getDate() - 90);
      break;
    case '1y':
      startDate.setFullYear(startDate.getFullYear() - 1);
      break;
    default:
      startDate.setDate(startDate.getDate() - 30);
  }

  // Get user statistics
  const totalUsers = await User.countDocuments();
  const verifiedUsers = await User.countDocuments({ isVerified: true });
  const pendingUsers = await User.countDocuments({ isVerified: false });
  const tourists = await User.countDocuments({ role: 'tourist' });
  const hotelOwners = await User.countDocuments({ role: 'hotel_owner' });
  const guides = await User.countDocuments({ role: 'guide' });
  const drivers = await User.countDocuments({ role: 'driver' });
  const staff = await User.countDocuments({ role: 'staff' });

  // Get recent activity
  const recentUsers = await User.countDocuments({
    createdAt: { $gte: startDate }
  });

  const recentVerifications = await User.countDocuments({
    isVerified: true,
    updatedAt: { $gte: startDate }
  });

  // Get sample users for the report
  const users = await User.find({}, {
    firstName: 1,
    lastName: 1,
    email: 1,
    role: 1,
    isVerified: 1,
    createdAt: 1
  })
  .sort({ createdAt: -1 })
  .limit(20)
  .lean();

  // Format users for display
  const formattedUsers = users.map(user => ({
    name: `${user.firstName} ${user.lastName}`,
    email: user.email,
    role: user.role,
    status: user.isVerified ? 'verified' : 'pending',
    joined: user.createdAt.toLocaleDateString()
  }));

  return {
    period,
    startDate,
    endDate: new Date(),
    overview: {
      totalUsers,
      verifiedUsers,
      pendingUsers,
      tourists,
      hotelOwners,
      guides,
      drivers,
      staff
    },
    recent: {
      recentUsers,
      recentVerifications
    },
    users: formattedUsers
  };
};

// Helper function to fetch staff report data
const fetchStaffReportData = async (period) => {
  // Calculate date range based on period
  let startDate = new Date();
  switch (period) {
    case '7d':
      startDate.setDate(startDate.getDate() - 7);
      break;
    case '30d':
      startDate.setDate(startDate.getDate() - 30);
      break;
    case '90d':
      startDate.setDate(startDate.getDate() - 90);
      break;
    case '1y':
      startDate.setFullYear(startDate.getFullYear() - 1);
      break;
    default:
      startDate.setDate(startDate.getDate() - 30);
  }

  // Get staff statistics
  const totalStaff = await User.countDocuments({ role: 'staff' });
  const activeStaff = await User.countDocuments({ role: 'staff', isActive: true });
  const pendingStaff = await User.countDocuments({ role: 'staff', isVerified: false });
  const inactiveStaff = await User.countDocuments({ role: 'staff', isActive: false });
  
  // Get staff by role/level
  const managers = await User.countDocuments({ role: 'staff', 'profile.level': 'manager' });
  const supervisors = await User.countDocuments({ role: 'staff', 'profile.level': 'supervisor' });
  const regularStaff = await User.countDocuments({ role: 'staff', 'profile.level': { $nin: ['manager', 'supervisor'] } });

  // Get recent activity
  const recentStaff = await User.countDocuments({
    role: 'staff',
    createdAt: { $gte: startDate }
  });

  const recentActivations = await User.countDocuments({
    role: 'staff',
    isActive: true,
    updatedAt: { $gte: startDate }
  });

  // Get sample staff for the report
  const staff = await User.find({ role: 'staff' }, {
    firstName: 1,
    lastName: 1,
    email: 1,
    phone: 1,
    'profile.level': 1,
    isActive: 1,
    isVerified: 1,
    createdAt: 1
  })
  .sort({ createdAt: -1 })
  .limit(20)
  .lean();

  // Format staff for display
  const formattedStaff = staff.map(member => ({
    name: `${member.firstName} ${member.lastName}`,
    email: member.email,
    phone: member.phone || 'N/A',
    role: member.profile?.level || 'staff',
    status: member.isActive ? 'active' : 'inactive',
    joined: member.createdAt.toLocaleDateString()
  }));

  return {
    period,
    startDate,
    endDate: new Date(),
    overview: {
      totalStaff,
      activeStaff,
      pendingStaff,
      inactiveStaff,
      managers,
      supervisors,
      regularStaff
    },
    recent: {
      recentStaff,
      recentActivations
    },
    staff: formattedStaff
  };
};

// Helper function to fetch payroll report data
const fetchPayrollReportData = async (period) => {
  // Calculate date range based on period
  let startDate = new Date();
  switch (period) {
    case '7d':
      startDate.setDate(startDate.getDate() - 7);
      break;
    case '30d':
      startDate.setDate(startDate.getDate() - 30);
      break;
    case '90d':
      startDate.setDate(startDate.getDate() - 90);
      break;
    case '1y':
      startDate.setFullYear(startDate.getFullYear() - 1);
      break;
    default:
      startDate.setDate(startDate.getDate() - 30);
  }

  // Get payroll statistics
  const totalStaff = await User.countDocuments({ role: 'staff' });
  const paidStaff = await User.countDocuments({ 
    role: 'staff', 
    'payroll.status': 'paid',
    'payroll.payPeriod': { $gte: startDate }
  });
  const pendingStaff = await User.countDocuments({ 
    role: 'staff', 
    'payroll.status': 'pending',
    'payroll.payPeriod': { $gte: startDate }
  });

  // Calculate total payroll amounts
  const payrollAggregation = await User.aggregate([
    { $match: { role: 'staff' } },
    { $unwind: '$payroll' },
    { $match: { 'payroll.payPeriod': { $gte: startDate } } },
    {
      $group: {
        _id: null,
        totalPayroll: { $sum: '$payroll.netSalary' },
        totalAllowances: { $sum: '$payroll.allowances' },
        totalDeductions: { $sum: '$payroll.deductions' },
        averageSalary: { $avg: '$payroll.netSalary' }
      }
    }
  ]);

  const payrollStats = payrollAggregation[0] || {
    totalPayroll: 0,
    totalAllowances: 0,
    totalDeductions: 0,
    averageSalary: 0
  };

  // Get recent activity
  const recentPayments = await User.countDocuments({
    role: 'staff',
    'payroll.status': 'paid',
    'payroll.paymentDate': { $gte: startDate }
  });

  const pendingPayments = await User.countDocuments({
    role: 'staff',
    'payroll.status': 'pending',
    'payroll.payPeriod': { $gte: startDate }
  });

  // Get sample payroll records for the report
  const payrollRecords = await User.find({ 
    role: 'staff',
    'payroll.payPeriod': { $gte: startDate }
  }, {
    firstName: 1,
    lastName: 1,
    'profile.position': 1,
    'payroll.baseSalary': 1,
    'payroll.allowances': 1,
    'payroll.deductions': 1,
    'payroll.netSalary': 1,
    'payroll.status': 1,
    'payroll.payPeriod': 1,
    'payroll.paymentDate': 1
  })
  .sort({ 'payroll.payPeriod': -1 })
  .limit(20)
  .lean();

  // Format payroll records for display
  const formattedPayroll = payrollRecords.map(record => {
    const payroll = record.payroll || {};
    return {
      staffName: `${record.firstName} ${record.lastName}`,
      position: record.profile?.position || 'Staff',
      baseSalary: payroll.baseSalary || 0,
      allowances: payroll.allowances || 0,
      deductions: payroll.deductions || 0,
      netSalary: payroll.netSalary || 0,
      status: payroll.status || 'pending',
      payPeriod: payroll.payPeriod || 'N/A',
      paymentDate: payroll.paymentDate ? new Date(payroll.paymentDate).toLocaleDateString() : null
    };
  });

  return {
    period,
    startDate,
    endDate: new Date(),
    overview: {
      totalStaff,
      paidStaff,
      pendingStaff,
      totalPayroll: payrollStats.totalPayroll,
      averageSalary: Math.round(payrollStats.averageSalary),
      totalAllowances: payrollStats.totalAllowances,
      totalDeductions: payrollStats.totalDeductions
    },
    recent: {
      recentPayments,
      pendingPayments
    },
    payroll: formattedPayroll
  };
};

// Helper function to fetch permissions report data
const fetchPermissionsReportData = async (period) => {
  // Calculate date range based on period
  let startDate = new Date();
  switch (period) {
    case '7d':
      startDate.setDate(startDate.getDate() - 7);
      break;
    case '30d':
      startDate.setDate(startDate.getDate() - 30);
      break;
    case '90d':
      startDate.setDate(startDate.getDate() - 90);
      break;
    case '1y':
      startDate.setFullYear(startDate.getFullYear() - 1);
      break;
    default:
      startDate.setDate(startDate.getDate() - 30);
  }

  // Get permission template statistics
  const totalTemplates = await User.countDocuments({ 
    role: 'staff',
    'profile.permissions': { $exists: true, $ne: [] }
  });

  const totalStaff = await User.countDocuments({ role: 'staff' });
  
  // Count staff by permission level
  const managersWithFullAccess = await User.countDocuments({
    role: 'staff',
    'profile.level': 'manager'
  });

  const staffWithLimitedAccess = await User.countDocuments({
    role: 'staff',
    'profile.level': { $in: ['supervisor', 'staff'] }
  });

  // Calculate total permissions
  const permissionStats = await User.aggregate([
    { $match: { role: 'staff', 'profile.permissions': { $exists: true } } },
    { $unwind: '$profile.permissions' },
    { $unwind: '$profile.permissions.actions' },
    {
      $group: {
        _id: null,
        totalPermissions: { $sum: 1 },
        activePermissions: { 
          $sum: { 
            $cond: [{ $ne: ['$profile.permissions.actions', null] }, 1, 0] 
          } 
        }
      }
    }
  ]);

  const permissions = permissionStats[0] || { totalPermissions: 0, activePermissions: 0 };

  // Get recent activity
  const recentTemplateUpdates = await User.countDocuments({
    role: 'staff',
    'profile.permissions.updatedAt': { $gte: startDate }
  });

  const recentPermissionChanges = await User.countDocuments({
    role: 'staff',
    'profile.updatedAt': { $gte: startDate }
  });

  // Get permission templates (mock data for now)
  const templates = [
    {
      name: 'Manager Template',
      description: 'Full access to all modules and features',
      permissions: {
        users: { view: true, create: true, edit: true, delete: true },
        bookings: { view: true, create: true, edit: true, delete: true },
        vehicles: { view: true, create: true, edit: true, delete: true },
        reports: { view: true, create: true, edit: true, delete: true }
      },
      staffCount: managersWithFullAccess
    },
    {
      name: 'Staff Template',
      description: 'Limited access for general staff operations',
      permissions: {
        users: { view: true, create: false, edit: false, delete: false },
        bookings: { view: true, create: false, edit: true, delete: false },
        vehicles: { view: true, create: true, edit: false, delete: false },
        reports: { view: true, create: false, edit: false, delete: false }
      },
      staffCount: staffWithLimitedAccess
    }
  ];

  // Get staff permissions
  const staffMembers = await User.find({ role: 'staff' }, {
    firstName: 1,
    lastName: 1,
    'profile.level': 1,
    'profile.permissions': 1
  })
  .sort({ 'profile.level': 1 })
  .limit(20)
  .lean();

  // Format staff permissions for display
  const staffPermissions = staffMembers.map(member => {
    const permissions = member.profile?.permissions || [];
    const permissionMap = {};
    
    permissions.forEach(perm => {
      permissionMap[perm.module] = {
        view: perm.actions.includes('read') || perm.actions.includes('view'),
        create: perm.actions.includes('create'),
        edit: perm.actions.includes('edit') || perm.actions.includes('update'),
        delete: perm.actions.includes('delete')
      };
    });

    return {
      staffName: `${member.firstName} ${member.lastName}`,
      role: member.profile?.level || 'Staff',
      template: member.profile?.level === 'manager' ? 'Manager Template' : 'Staff Template',
      permissions: permissionMap
    };
  });

  return {
    period,
    startDate,
    endDate: new Date(),
    overview: {
      totalTemplates: templates.length,
      totalStaff,
      managersWithFullAccess,
      staffWithLimitedAccess,
      totalPermissions: permissions.totalPermissions,
      activePermissions: permissions.activePermissions
    },
    recent: {
      recentTemplateUpdates,
      recentPermissionChanges
    },
    templates,
    staffPermissions
  };
};

// Helper function to fetch analytics report data
const fetchAnalyticsReportData = async (period) => {
  // Calculate date range based on period
  let startDate = new Date();
  switch (period) {
    case '7d':
      startDate.setDate(startDate.getDate() - 7);
      break;
    case '30d':
      startDate.setDate(startDate.getDate() - 30);
      break;
    case '90d':
      startDate.setDate(startDate.getDate() - 90);
      break;
    case '1y':
      startDate.setFullYear(startDate.getFullYear() - 1);
      break;
    default:
      startDate.setDate(startDate.getDate() - 30);
  }

  // Get user analytics
  const newUsers = await User.countDocuments({
    createdAt: { $gte: startDate }
  });

  const avgActiveUsers = await User.countDocuments({
    isActive: true,
    lastLogin: { $gte: startDate }
  });

  // Get booking analytics
  const totalBookings = await Booking.countDocuments({
    createdAt: { $gte: startDate }
  });

  // Calculate total revenue
  const revenueAggregation = await Booking.aggregate([
    { $match: { createdAt: { $gte: startDate } } },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$totalAmount' }
      }
    }
  ]);

  const totalRevenue = revenueAggregation[0]?.totalRevenue || 0;

  // Get previous period data for growth calculation
  const previousStartDate = new Date(startDate);
  previousStartDate.setDate(previousStartDate.getDate() - (period === '7d' ? 7 : 30));

  const previousNewUsers = await User.countDocuments({
    createdAt: { $gte: previousStartDate, $lt: startDate }
  });

  const previousBookings = await Booking.countDocuments({
    createdAt: { $gte: previousStartDate, $lt: startDate }
  });

  // Calculate growth percentages
  const userGrowth = previousNewUsers > 0 ? ((newUsers - previousNewUsers) / previousNewUsers) * 100 : 0;
  const bookingGrowth = previousBookings > 0 ? ((totalBookings - previousBookings) / previousBookings) * 100 : 0;

  // Get user trends (daily for last 7 days)
  const userTrends = await User.aggregate([
    {
      $match: {
        createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
      }
    },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
        },
        users: { $sum: 1 }
      }
    },
    { $sort: { '_id': 1 } }
  ]);

  // Get booking trends by category
  const bookingTrends = await Booking.aggregate([
    { $match: { createdAt: { $gte: startDate } } },
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 }
      }
    }
  ]);

  const totalBookingCount = bookingTrends.reduce((sum, item) => sum + item.count, 0);
  const formattedBookingTrends = bookingTrends.map(trend => ({
    category: trend._id || 'Other',
    count: trend.count,
    percentage: totalBookingCount > 0 ? (trend.count / totalBookingCount) * 100 : 0
  }));

  // Get top performing items
  const topTours = await Booking.aggregate([
    { $match: { type: 'tour', createdAt: { $gte: startDate } } },
    {
      $group: {
        _id: '$tourId',
        bookings: { $sum: 1 },
        revenue: { $sum: '$totalAmount' }
      }
    },
    { $sort: { bookings: -1 } },
    { $limit: 5 }
  ]);

  const topHotels = await Booking.aggregate([
    { $match: { type: 'hotel', createdAt: { $gte: startDate } } },
    {
      $group: {
        _id: '$hotelId',
        bookings: { $sum: 1 },
        revenue: { $sum: '$totalAmount' }
      }
    },
    { $sort: { bookings: -1 } },
    { $limit: 5 }
  ]);

  const topVehicles = await Booking.aggregate([
    { $match: { type: 'vehicle', createdAt: { $gte: startDate } } },
    {
      $group: {
        _id: '$vehicleId',
        bookings: { $sum: 1 },
        revenue: { $sum: '$totalAmount' }
      }
    },
    { $sort: { bookings: -1 } },
    { $limit: 5 }
  ]);

  return {
    period,
    startDate,
    endDate: new Date(),
    overview: {
      newUsers,
      avgActiveUsers,
      totalBookings,
      totalRevenue,
      userGrowth: Math.round(userGrowth * 10) / 10,
      activeUserGrowth: Math.round(userGrowth * 10) / 10, // Same as user growth for now
      bookingGrowth: Math.round(bookingGrowth * 10) / 10,
      revenueGrowth: 15.2 // Mock value for now
    },
    recent: {
      recentUsers: newUsers,
      recentBookings: totalBookings,
      recentRevenue: totalRevenue
    },
    userTrends: userTrends.map(trend => ({
      date: trend._id,
      users: trend.users
    })),
    bookingTrends: formattedBookingTrends,
    topPerforming: {
      topTours: topTours.map(tour => ({
        name: `Tour ${tour._id}`,
        bookings: tour.bookings,
        revenue: tour.revenue
      })),
      topHotels: topHotels.map(hotel => ({
        name: `Hotel ${hotel._id}`,
        bookings: hotel.bookings,
        revenue: hotel.revenue
      })),
      topVehicles: topVehicles.map(vehicle => ({
        name: `Vehicle ${vehicle._id}`,
        bookings: vehicle.bookings,
        revenue: vehicle.revenue
      }))
    }
  };
};

// Helper function to generate HTML content
const generateHTMLReport = (data, reportType) => {
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const reportTitle = reportType === 'users' ? 'User Management Report' : 
                     reportType === 'staff' ? 'Staff Management Report' : 
                     reportType === 'payroll' ? 'Payroll Management Report' :
                     reportType === 'permissions' ? 'Permissions Management Report' :
                     reportType === 'analytics' ? 'Analytics Dashboard Report' :
                     'Platform Performance Report';
  const reportTypeDisplay = reportType === 'users' ? 'User Management Report' : 
                           reportType === 'staff' ? 'Staff Management Report' : 
                           reportType === 'payroll' ? 'Payroll Management Report' :
                           reportType === 'permissions' ? 'Permissions Management Report' :
                           reportType === 'analytics' ? 'Analytics Dashboard Report' :
                           'Dashboard Report';

  // Generate content based on report type
  const generateContent = () => {
    if (reportType === 'users') {
      return generateUserReportContent(data);
    } else if (reportType === 'staff') {
      return generateStaffReportContent(data);
    } else if (reportType === 'payroll') {
      return generatePayrollReportContent(data);
    } else if (reportType === 'permissions') {
      return generatePermissionsReportContent(data);
    } else if (reportType === 'analytics') {
      return generateAnalyticsReportContent(data);
    } else {
      return generateDashboardReportContent(data);
    }
  };

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>SerendibGo ${reportTitle}</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: 'Arial', sans-serif;
                line-height: 1.6;
                color: #333;
                background: white;
            }
            
            .header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 30px;
                text-align: center;
                margin-bottom: 30px;
            }
            
            .header h1 {
                font-size: 2.5em;
                margin-bottom: 10px;
                font-weight: bold;
            }
            
            .header p {
                font-size: 1.2em;
                opacity: 0.9;
            }
            
            .company-info {
                background: #f8f9fa;
                padding: 20px;
                margin-bottom: 30px;
                border-left: 4px solid #667eea;
            }
            
            .company-info h2 {
                color: #667eea;
                margin-bottom: 15px;
                font-size: 1.5em;
            }
            
            .company-info p {
                margin-bottom: 5px;
                font-size: 1.1em;
            }
            
            .report-info {
                background: #e3f2fd;
                padding: 15px;
                margin-bottom: 30px;
                border-radius: 8px;
            }
            
            .report-info h3 {
                color: #1976d2;
                margin-bottom: 10px;
            }
            
            .stats-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 20px;
                margin-bottom: 30px;
            }
            
            .stat-card {
                background: white;
                border: 1px solid #e0e0e0;
                border-radius: 8px;
                padding: 20px;
                text-align: center;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            
            .stat-card h4 {
                color: #666;
                font-size: 0.9em;
                margin-bottom: 10px;
                text-transform: uppercase;
                letter-spacing: 1px;
            }
            
            .stat-card .value {
                font-size: 2em;
                font-weight: bold;
                color: #333;
                margin-bottom: 5px;
            }
            
            .stat-card .label {
                color: #888;
                font-size: 0.9em;
            }
            
            .section {
                margin-bottom: 30px;
            }
            
            .section h3 {
                color: #333;
                border-bottom: 2px solid #667eea;
                padding-bottom: 10px;
                margin-bottom: 20px;
                font-size: 1.3em;
            }
            
            .table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 20px;
            }
            
            .table th,
            .table td {
                border: 1px solid #ddd;
                padding: 12px;
                text-align: left;
            }
            
            .table th {
                background: #f8f9fa;
                font-weight: bold;
                color: #333;
            }
            
            .table tr:nth-child(even) {
                background: #f9f9f9;
            }
            
            .footer {
                margin-top: 50px;
                padding: 30px;
                background: #f8f9fa;
                border-top: 2px solid #667eea;
            }
            
            .signature-section {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-top: 30px;
            }
            
            .signature-box {
                text-align: center;
                min-width: 200px;
            }
            
            .signature-line {
                border-bottom: 1px solid #333;
                width: 150px;
                margin: 0 auto 10px;
                height: 40px;
            }
            
            .signature-label {
                font-size: 0.9em;
                color: #666;
            }
            
            .date-section {
                text-align: right;
            }
            
            .date-section p {
                margin-bottom: 5px;
            }
            
            @media print {
                body { margin: 0; }
                .header { page-break-inside: avoid; }
                .section { page-break-inside: avoid; }
            }
        </style>
    </head>
    <body>
        <!-- Company Header -->
        <div class="header">
            <h1>SerendibGo</h1>
            <p>Your Gateway to Sri Lankan Adventures</p>
        </div>
        
        <!-- Company Information -->
        <div class="company-info">
            <h2>Company Information</h2>
            <p><strong>Company Name:</strong> SerendibGo (Pvt) Ltd</p>
            <p><strong>Address:</strong> 123 Colombo Street, Colombo 03, Sri Lanka</p>
            <p><strong>Phone:</strong> +94 11 234 5678</p>
            <p><strong>Email:</strong> info@serendibgo.com</p>
            <p><strong>Website:</strong> www.serendibgo.com</p>
            <p><strong>Registration:</strong> PV 123456789</p>
        </div>
        
        <!-- Report Information -->
        <div class="report-info">
            <h3>${reportTitle}</h3>
            <p><strong>Report Period:</strong> ${data.period.toUpperCase()} (${data.startDate.toLocaleDateString()} - ${data.endDate.toLocaleDateString()})</p>
            <p><strong>Generated On:</strong> ${currentDate}</p>
            <p><strong>Report Type:</strong> ${reportTypeDisplay}</p>
        </div>
        
        ${generateContent()}
        
        <!-- Footer with Signature -->
        <div class="footer">
            <div class="signature-section">
                <div class="signature-box">
                    <div class="signature-line"></div>
                    <div class="signature-label">Authorized Signature</div>
                </div>
                <div class="date-section">
                    <p><strong>Report Generated:</strong> ${currentDate}</p>
                    <p><strong>Generated By:</strong> SerendibGo Admin System</p>
                    <p><strong>Report ID:</strong> SRG-${Date.now().toString().slice(-6)}</p>
                </div>
            </div>
            
            <div style="margin-top: 30px; text-align: center; color: #666; font-size: 0.9em;">
                <p>This report was automatically generated by the SerendibGo Platform Management System.</p>
                <p>For questions or clarifications, please contact our support team at support@serendibgo.com</p>
            </div>
        </div>
    </body>
    </html>
  `;
};

// Generate user report content
const generateUserReportContent = (data) => {
  return `
    <!-- User Statistics -->
    <div class="section">
        <h3>User Overview</h3>
        <div class="stats-grid">
            <div class="stat-card">
                <h4>Total Users</h4>
                <div class="value">${data.overview.totalUsers}</div>
                <div class="label">Registered Users</div>
            </div>
            <div class="stat-card">
                <h4>Verified Users</h4>
                <div class="value">${data.overview.verifiedUsers}</div>
                <div class="label">Verified Accounts</div>
            </div>
            <div class="stat-card">
                <h4>Pending Users</h4>
                <div class="value">${data.overview.pendingUsers}</div>
                <div class="label">Awaiting Verification</div>
            </div>
            <div class="stat-card">
                <h4>Tourists</h4>
                <div class="value">${data.overview.tourists}</div>
                <div class="label">Tourist Accounts</div>
            </div>
            <div class="stat-card">
                <h4>Hotel Owners</h4>
                <div class="value">${data.overview.hotelOwners}</div>
                <div class="label">Hotel Owner Accounts</div>
            </div>
            <div class="stat-card">
                <h4>Tour Guides</h4>
                <div class="value">${data.overview.guides}</div>
                <div class="label">Guide Accounts</div>
            </div>
            <div class="stat-card">
                <h4>Drivers</h4>
                <div class="value">${data.overview.drivers}</div>
                <div class="label">Driver Accounts</div>
            </div>
            <div class="stat-card">
                <h4>Staff</h4>
                <div class="value">${data.overview.staff}</div>
                <div class="label">Staff Accounts</div>
            </div>
        </div>
    </div>
    
    <!-- Recent Activity -->
    <div class="section">
        <h3>Recent Activity (${data.period.toUpperCase()})</h3>
        <div class="stats-grid">
            <div class="stat-card">
                <h4>New Users</h4>
                <div class="value">${data.recent.recentUsers}</div>
                <div class="label">Registered This Period</div>
            </div>
            <div class="stat-card">
                <h4>Verifications</h4>
                <div class="value">${data.recent.recentVerifications}</div>
                <div class="label">Verified This Period</div>
            </div>
        </div>
    </div>
    
    <!-- User List -->
    <div class="section">
        <h3>Recent Users</h3>
        <table class="table">
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Joined</th>
                </tr>
            </thead>
            <tbody>
                ${data.users.map(user => `
                    <tr>
                        <td>${user.name}</td>
                        <td>${user.email}</td>
                        <td>${user.role}</td>
                        <td>${user.status}</td>
                        <td>${user.joined}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    </div>
  `;
};

// Generate staff report content
const generateStaffReportContent = (data) => {
  return `
    <!-- Staff Statistics -->
    <div class="section">
        <h3>Staff Overview</h3>
        <div class="stats-grid">
            <div class="stat-card">
                <h4>Total Staff</h4>
                <div class="value">${data.overview.totalStaff}</div>
                <div class="label">Staff Members</div>
            </div>
            <div class="stat-card">
                <h4>Active Staff</h4>
                <div class="value">${data.overview.activeStaff}</div>
                <div class="label">Active Members</div>
            </div>
            <div class="stat-card">
                <h4>Pending Staff</h4>
                <div class="value">${data.overview.pendingStaff}</div>
                <div class="label">Awaiting Verification</div>
            </div>
            <div class="stat-card">
                <h4>Inactive Staff</h4>
                <div class="value">${data.overview.inactiveStaff}</div>
                <div class="label">Inactive Members</div>
            </div>
            <div class="stat-card">
                <h4>Managers</h4>
                <div class="value">${data.overview.managers}</div>
                <div class="label">Manager Level</div>
            </div>
            <div class="stat-card">
                <h4>Supervisors</h4>
                <div class="value">${data.overview.supervisors}</div>
                <div class="label">Supervisor Level</div>
            </div>
            <div class="stat-card">
                <h4>Regular Staff</h4>
                <div class="value">${data.overview.regularStaff}</div>
                <div class="label">Regular Level</div>
            </div>
        </div>
    </div>
    
    <!-- Recent Activity -->
    <div class="section">
        <h3>Recent Activity (${data.period.toUpperCase()})</h3>
        <div class="stats-grid">
            <div class="stat-card">
                <h4>New Staff</h4>
                <div class="value">${data.recent.recentStaff}</div>
                <div class="label">Added This Period</div>
            </div>
            <div class="stat-card">
                <h4>Activations</h4>
                <div class="value">${data.recent.recentActivations}</div>
                <div class="label">Activated This Period</div>
            </div>
        </div>
    </div>
    
    <!-- Staff List -->
    <div class="section">
        <h3>Staff Members</h3>
        <table class="table">
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Joined</th>
                </tr>
            </thead>
            <tbody>
                ${data.staff.map(member => `
                    <tr>
                        <td>${member.name}</td>
                        <td>${member.email}</td>
                        <td>${member.phone}</td>
                        <td>${member.role}</td>
                        <td>${member.status}</td>
                        <td>${member.joined}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    </div>
  `;
};

// Generate payroll report content
const generatePayrollReportContent = (data) => {
  return `
    <!-- Payroll Statistics -->
    <div class="section">
        <h3>Payroll Overview</h3>
        <div class="stats-grid">
            <div class="stat-card">
                <h4>Total Staff</h4>
                <div class="value">${data.overview.totalStaff}</div>
                <div class="label">Staff Members</div>
            </div>
            <div class="stat-card">
                <h4>Paid Staff</h4>
                <div class="value">${data.overview.paidStaff}</div>
                <div class="label">Paid This Period</div>
            </div>
            <div class="stat-card">
                <h4>Pending Staff</h4>
                <div class="value">${data.overview.pendingStaff}</div>
                <div class="label">Pending Payment</div>
            </div>
            <div class="stat-card">
                <h4>Total Payroll</h4>
                <div class="value">Rs. ${data.overview.totalPayroll.toLocaleString()}</div>
                <div class="label">Total Amount</div>
            </div>
            <div class="stat-card">
                <h4>Average Salary</h4>
                <div class="value">Rs. ${data.overview.averageSalary.toLocaleString()}</div>
                <div class="label">Per Staff Member</div>
            </div>
            <div class="stat-card">
                <h4>Total Allowances</h4>
                <div class="value">Rs. ${data.overview.totalAllowances.toLocaleString()}</div>
                <div class="label">Allowances Paid</div>
            </div>
            <div class="stat-card">
                <h4>Total Deductions</h4>
                <div class="value">Rs. ${data.overview.totalDeductions.toLocaleString()}</div>
                <div class="label">Deductions Made</div>
            </div>
        </div>
    </div>
    
    <!-- Recent Activity -->
    <div class="section">
        <h3>Recent Activity (${data.period.toUpperCase()})</h3>
        <div class="stats-grid">
            <div class="stat-card">
                <h4>Recent Payments</h4>
                <div class="value">${data.recent.recentPayments}</div>
                <div class="label">Payments Processed</div>
            </div>
            <div class="stat-card">
                <h4>Pending Payments</h4>
                <div class="value">${data.recent.pendingPayments}</div>
                <div class="label">Awaiting Processing</div>
            </div>
        </div>
    </div>
    
    <!-- Payroll Records -->
    <div class="section">
        <h3>Payroll Records</h3>
        <table class="table">
            <thead>
                <tr>
                    <th>Staff Name</th>
                    <th>Position</th>
                    <th>Base Salary</th>
                    <th>Allowances</th>
                    <th>Deductions</th>
                    <th>Net Salary</th>
                    <th>Status</th>
                    <th>Pay Period</th>
                    <th>Payment Date</th>
                </tr>
            </thead>
            <tbody>
                ${data.payroll.map(record => `
                    <tr>
                        <td>${record.staffName}</td>
                        <td>${record.position}</td>
                        <td>Rs. ${record.baseSalary.toLocaleString()}</td>
                        <td>Rs. ${record.allowances.toLocaleString()}</td>
                        <td>Rs. ${record.deductions.toLocaleString()}</td>
                        <td>Rs. ${record.netSalary.toLocaleString()}</td>
                        <td>${record.status}</td>
                        <td>${record.payPeriod}</td>
                        <td>${record.paymentDate || 'Pending'}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    </div>
  `;
};

// Generate permissions report content
const generatePermissionsReportContent = (data) => {
  return `
    <!-- Permissions Statistics -->
    <div class="section">
        <h3>Permissions Overview</h3>
        <div class="stats-grid">
            <div class="stat-card">
                <h4>Total Templates</h4>
                <div class="value">${data.overview.totalTemplates}</div>
                <div class="label">Permission Templates</div>
            </div>
            <div class="stat-card">
                <h4>Total Staff</h4>
                <div class="value">${data.overview.totalStaff}</div>
                <div class="label">Staff Members</div>
            </div>
            <div class="stat-card">
                <h4>Managers</h4>
                <div class="value">${data.overview.managersWithFullAccess}</div>
                <div class="label">Full Access</div>
            </div>
            <div class="stat-card">
                <h4>Staff</h4>
                <div class="value">${data.overview.staffWithLimitedAccess}</div>
                <div class="label">Limited Access</div>
            </div>
            <div class="stat-card">
                <h4>Total Permissions</h4>
                <div class="value">${data.overview.totalPermissions}</div>
                <div class="label">Permission Entries</div>
            </div>
            <div class="stat-card">
                <h4>Active Permissions</h4>
                <div class="value">${data.overview.activePermissions}</div>
                <div class="label">Currently Active</div>
            </div>
        </div>
    </div>
    
    <!-- Recent Activity -->
    <div class="section">
        <h3>Recent Activity (${data.period.toUpperCase()})</h3>
        <div class="stats-grid">
            <div class="stat-card">
                <h4>Template Updates</h4>
                <div class="value">${data.recent.recentTemplateUpdates}</div>
                <div class="label">Templates Modified</div>
            </div>
            <div class="stat-card">
                <h4>Permission Changes</h4>
                <div class="value">${data.recent.recentPermissionChanges}</div>
                <div class="label">Staff Permissions Updated</div>
            </div>
        </div>
    </div>
    
    <!-- Permission Templates -->
    <div class="section">
        <h3>Permission Templates</h3>
        ${data.templates.map(template => `
            <div style="margin-bottom: 30px; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; background: #f9f9f9;">
                <h4 style="color: #333; margin-bottom: 10px;">${template.name}</h4>
                <p style="color: #666; margin-bottom: 15px;">${template.description}</p>
                <p style="color: #888; font-size: 0.9em; margin-bottom: 15px;"><strong>Staff Count:</strong> ${template.staffCount}</p>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
                    ${Object.entries(template.permissions).map(([module, actions]) => `
                        <div style="background: white; padding: 15px; border-radius: 6px; border: 1px solid #ddd;">
                            <h5 style="color: #333; margin-bottom: 10px; text-transform: capitalize;">${module}</h5>
                            <div style="display: flex; flex-wrap: wrap; gap: 5px;">
                                ${Object.entries(actions).map(([action, enabled]) => `
                                    <span style="padding: 2px 8px; border-radius: 4px; font-size: 0.8em; 
                                        background: ${enabled ? '#4caf50' : '#f5f5f5'}; 
                                        color: ${enabled ? 'white' : '#666'};">
                                        ${action}
                                    </span>
                                `).join('')}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('')}
    </div>
    
    <!-- Staff Permissions -->
    <div class="section">
        <h3>Staff Permissions</h3>
        <table class="table">
            <thead>
                <tr>
                    <th>Staff Name</th>
                    <th>Role</th>
                    <th>Template</th>
                    <th>Users</th>
                    <th>Bookings</th>
                    <th>Vehicles</th>
                    <th>Reports</th>
                </tr>
            </thead>
            <tbody>
                ${data.staffPermissions.map(staff => `
                    <tr>
                        <td>${staff.staffName}</td>
                        <td>${staff.role}</td>
                        <td>${staff.template}</td>
                        <td>
                            ${Object.entries(staff.permissions.users || {}).map(([action, enabled]) => 
                                `<span style="padding: 1px 4px; border-radius: 3px; font-size: 0.7em; margin-right: 2px;
                                    background: ${enabled ? '#4caf50' : '#f5f5f5'}; 
                                    color: ${enabled ? 'white' : '#666'};">
                                    ${action}
                                </span>`
                            ).join('')}
                        </td>
                        <td>
                            ${Object.entries(staff.permissions.bookings || {}).map(([action, enabled]) => 
                                `<span style="padding: 1px 4px; border-radius: 3px; font-size: 0.7em; margin-right: 2px;
                                    background: ${enabled ? '#4caf50' : '#f5f5f5'}; 
                                    color: ${enabled ? 'white' : '#666'};">
                                    ${action}
                                </span>`
                            ).join('')}
                        </td>
                        <td>
                            ${Object.entries(staff.permissions.vehicles || {}).map(([action, enabled]) => 
                                `<span style="padding: 1px 4px; border-radius: 3px; font-size: 0.7em; margin-right: 2px;
                                    background: ${enabled ? '#4caf50' : '#f5f5f5'}; 
                                    color: ${enabled ? 'white' : '#666'};">
                                    ${action}
                                </span>`
                            ).join('')}
                        </td>
                        <td>
                            ${Object.entries(staff.permissions.reports || {}).map(([action, enabled]) => 
                                `<span style="padding: 1px 4px; border-radius: 3px; font-size: 0.7em; margin-right: 2px;
                                    background: ${enabled ? '#4caf50' : '#f5f5f5'}; 
                                    color: ${enabled ? 'white' : '#666'};">
                                    ${action}
                                </span>`
                            ).join('')}
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    </div>
  `;
};

// Generate analytics report content
const generateAnalyticsReportContent = (data) => {
  return `
    <!-- Analytics Statistics -->
    <div class="section">
        <h3>Key Performance Metrics</h3>
        <div class="stats-grid">
            <div class="stat-card">
                <h4>New Users (${data.period.toUpperCase()})</h4>
                <div class="value">${data.overview.newUsers}</div>
                <div class="label">+${data.overview.userGrowth}% Growth</div>
            </div>
            <div class="stat-card">
                <h4>Avg Active Users</h4>
                <div class="value">${data.overview.avgActiveUsers}</div>
                <div class="label">+${data.overview.activeUserGrowth}% Growth</div>
            </div>
            <div class="stat-card">
                <h4>Total Bookings</h4>
                <div class="value">${data.overview.totalBookings}</div>
                <div class="label">+${data.overview.bookingGrowth}% Growth</div>
            </div>
            <div class="stat-card">
                <h4>Total Revenue</h4>
                <div class="value">Rs. ${data.overview.totalRevenue.toLocaleString()}</div>
                <div class="label">+${data.overview.revenueGrowth}% Growth</div>
            </div>
        </div>
    </div>
    
    <!-- Recent Activity -->
    <div class="section">
        <h3>Recent Activity Summary (${data.period.toUpperCase()})</h3>
        <div class="stats-grid">
            <div class="stat-card">
                <h4>Recent Users</h4>
                <div class="value">${data.recent.recentUsers}</div>
                <div class="label">New Registrations</div>
            </div>
            <div class="stat-card">
                <h4>Recent Bookings</h4>
                <div class="value">${data.recent.recentBookings}</div>
                <div class="label">New Bookings</div>
            </div>
            <div class="stat-card">
                <h4>Recent Revenue</h4>
                <div class="value">Rs. ${data.recent.recentRevenue.toLocaleString()}</div>
                <div class="label">Revenue Generated</div>
            </div>
        </div>
    </div>
    
    <!-- User Trends -->
    <div class="section">
        <h3>User Growth Trends</h3>
        <table class="table">
            <thead>
                <tr>
                    <th>Date</th>
                    <th>New Users</th>
                    <th>Cumulative Growth</th>
                </tr>
            </thead>
            <tbody>
                ${data.userTrends.map((trend, index) => `
                    <tr>
                        <td>${trend.date}</td>
                        <td>${trend.users}</td>
                        <td>${data.userTrends.slice(0, index + 1).reduce((sum, t) => sum + t.users, 0)}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    </div>
    
    <!-- Booking Trends -->
    <div class="section">
        <h3>Booking Distribution</h3>
        <table class="table">
            <thead>
                <tr>
                    <th>Category</th>
                    <th>Count</th>
                    <th>Percentage</th>
                </tr>
            </thead>
            <tbody>
                ${data.bookingTrends.map(trend => `
                    <tr>
                        <td>${trend.category}</td>
                        <td>${trend.count}</td>
                        <td>${trend.percentage.toFixed(1)}%</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    </div>
    
    <!-- Top Performing Items -->
    <div class="section">
        <h3>Top Performing Items</h3>
        
        ${data.topPerforming.topTours.length > 0 ? `
        <h4 style="color: #333; margin-bottom: 15px;">Top Tours</h4>
        <table class="table" style="margin-bottom: 30px;">
            <thead>
                <tr>
                    <th>Tour Name</th>
                    <th>Bookings</th>
                    <th>Revenue</th>
                </tr>
            </thead>
            <tbody>
                ${data.topPerforming.topTours.map(tour => `
                    <tr>
                        <td>${tour.name}</td>
                        <td>${tour.bookings}</td>
                        <td>Rs. ${tour.revenue.toLocaleString()}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
        ` : ''}
        
        ${data.topPerforming.topHotels.length > 0 ? `
        <h4 style="color: #333; margin-bottom: 15px;">Top Hotels</h4>
        <table class="table" style="margin-bottom: 30px;">
            <thead>
                <tr>
                    <th>Hotel Name</th>
                    <th>Bookings</th>
                    <th>Revenue</th>
                </tr>
            </thead>
            <tbody>
                ${data.topPerforming.topHotels.map(hotel => `
                    <tr>
                        <td>${hotel.name}</td>
                        <td>${hotel.bookings}</td>
                        <td>Rs. ${hotel.revenue.toLocaleString()}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
        ` : ''}
        
        ${data.topPerforming.topVehicles.length > 0 ? `
        <h4 style="color: #333; margin-bottom: 15px;">Top Vehicles</h4>
        <table class="table">
            <thead>
                <tr>
                    <th>Vehicle Name</th>
                    <th>Bookings</th>
                    <th>Revenue</th>
                </tr>
            </thead>
            <tbody>
                ${data.topPerforming.topVehicles.map(vehicle => `
                    <tr>
                        <td>${vehicle.name}</td>
                        <td>${vehicle.bookings}</td>
                        <td>Rs. ${vehicle.revenue.toLocaleString()}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
        ` : ''}
    </div>
  `;
};

// Generate dashboard report content
const generateDashboardReportContent = (data) => {
  return `
    <!-- Key Statistics -->
    <div class="section">
        <h3>Platform Overview</h3>
        <div class="stats-grid">
            <div class="stat-card">
                <h4>Total Users</h4>
                <div class="value">${data.overview.totalUsers}</div>
                <div class="label">Registered Users</div>
            </div>
            <div class="stat-card">
                <h4>Total Hotels</h4>
                <div class="value">${data.overview.totalHotels}</div>
                <div class="label">Registered Hotels</div>
            </div>
            <div class="stat-card">
                <h4>Total Bookings</h4>
                <div class="value">${data.overview.totalBookings}</div>
                <div class="label">Total Bookings</div>
            </div>
            <div class="stat-card">
                <h4>Total Revenue</h4>
                <div class="value">Rs. ${data.revenue.totalRevenue.toLocaleString()}</div>
                <div class="label">Platform Revenue</div>
            </div>
            <div class="stat-card">
                <h4>Active Staff</h4>
                <div class="value">${data.overview.totalStaff}</div>
                <div class="label">Staff Members</div>
            </div>
            <div class="stat-card">
                <h4>Pending Approvals</h4>
                <div class="value">${data.pending.pendingHotels + data.pending.pendingUsers}</div>
                <div class="label">Awaiting Review</div>
            </div>
        </div>
    </div>
    
    <!-- User Breakdown -->
    <div class="section">
        <h3>User Statistics</h3>
        <table class="table">
            <thead>
                <tr>
                    <th>User Type</th>
                    <th>Count</th>
                    <th>Percentage</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>Tourists</td>
                    <td>${data.overview.totalTourists}</td>
                    <td>${((data.overview.totalTourists / data.overview.totalUsers) * 100).toFixed(1)}%</td>
                </tr>
                <tr>
                    <td>Hotel Owners</td>
                    <td>${data.overview.totalHotelOwners}</td>
                    <td>${((data.overview.totalHotelOwners / data.overview.totalUsers) * 100).toFixed(1)}%</td>
                </tr>
                <tr>
                    <td>Staff Members</td>
                    <td>${data.overview.totalStaff}</td>
                    <td>${((data.overview.totalStaff / data.overview.totalUsers) * 100).toFixed(1)}%</td>
                </tr>
                <tr>
                    <td>Tour Guides</td>
                    <td>${data.overview.totalGuides}</td>
                    <td>${((data.overview.totalGuides / data.overview.totalUsers) * 100).toFixed(1)}%</td>
                </tr>
            </tbody>
        </table>
    </div>
    
    <!-- Recent Activity -->
    <div class="section">
        <h3>Recent Activity (${data.period.toUpperCase()})</h3>
        <div class="stats-grid">
            <div class="stat-card">
                <h4>New Users</h4>
                <div class="value">${data.recent.recentUsers}</div>
                <div class="label">Registered This Period</div>
            </div>
            <div class="stat-card">
                <h4>New Hotels</h4>
                <div class="value">${data.recent.recentHotels}</div>
                <div class="label">Added This Period</div>
            </div>
            <div class="stat-card">
                <h4>New Bookings</h4>
                <div class="value">${data.recent.recentBookings}</div>
                <div class="label">Created This Period</div>
            </div>
            <div class="stat-card">
                <h4>Avg Booking Value</h4>
                <div class="value">Rs. ${data.revenue.averageBookingValue.toLocaleString()}</div>
                <div class="label">Per Booking</div>
            </div>
        </div>
    </div>
    
    <!-- Top Performing Hotels -->
    ${data.topHotels && data.topHotels.length > 0 ? `
    <div class="section">
        <h3>Top Performing Hotels</h3>
        <table class="table">
            <thead>
                <tr>
                    <th>Hotel Name</th>
                    <th>Location</th>
                    <th>Total Bookings</th>
                    <th>Total Revenue</th>
                    <th>Rating</th>
                </tr>
            </thead>
            <tbody>
                ${data.topHotels.map(hotel => `
                    <tr>
                        <td>${hotel.name}</td>
                        <td>${hotel.location}</td>
                        <td>${hotel.totalBookings}</td>
                        <td>Rs. ${hotel.totalRevenue.toLocaleString()}</td>
                        <td>${hotel.rating || 'N/A'}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    </div>
    ` : ''}
  `;
};

// Helper function to generate PDF from HTML
const generatePDFFromHTML = async (htmlContent) => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '15mm',
        bottom: '20mm',
        left: '15mm'
      }
    });
    
    return pdfBuffer;
  } finally {
    await browser.close();
  }
};

module.exports = {
  generatePDFReport
};
