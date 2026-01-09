import { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Calendar } from '../ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/Checkbox';
import { Badge } from '../ui/Badge';
import { Clock, Calendar as CalendarIcon, MapPin, AlertCircle, Home } from 'lucide-react';
import { format, addDays, isWeekend, isSameDay, addHours, startOfDay, setHours, setMinutes } from 'date-fns';
import { useToast } from '../../hooks/use-toast';


export default function AdvancedCalendarScheduling({ property, onScheduled, onBack }) {
  const [selectedDate, setSelectedDate] = useState();
  const [selectedTime, setSelectedTime] = useState('');
  const [occupancyStatus, setOccupancyStatus] = useState('');
  const [allowEarlyInspection, setAllowEarlyInspection] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [existingAppointments, setExistingAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const { toast } = useToast();

  // Business rules
  const BUSINESS_HOURS = {
    monday: { start: '07:30', end: '17:30' },
    tuesday: { start: '07:30', end: '17:30' },
    wednesday: { start: '07:30', end: '17:30' },
    thursday: { start: '07:30', end: '17:30' },
    friday: { start: '07:30', end: '17:30' },
    saturday: { start: '07:30', end: '15:30' },
    sunday: null // Closed
  };

  const INSPECTION_DURATION = 120; // 2 hours
  const WALKTHROUGH_DURATION = 30; // 30 minutes
  const TRAVEL_TIME = 60; // 1 hour travel between appointments
  const MAX_INSPECTIONS_PER_DAY = 3;

  useEffect(() => {
    if (selectedDate) {
      generateTimeSlots(selectedDate);
    }
  }, [selectedDate, existingAppointments]);

  useEffect(() => {
    // Load existing appointments from server
    loadExistingAppointments();
  }, []);

  const loadExistingAppointments = async () => {
    try {
      const response = await fetch('/api/appointments/existing');
      if (response.ok) {
        const appointments = await response.json();
        setExistingAppointments(appointments);
      }
    } catch (error) {
      console.error('Failed to load existing appointments:', error);
    }
  };

  const generateTimeSlots = (date) => {
    const dayName = format(date, 'EEEE').toLowerCase();
    const businessHours = BUSINESS_HOURS[dayName];
    
    if (!businessHours) {
      setAvailableSlots([]);
      return;
    }

    const slots = [];
    const [startHour, startMinute] = businessHours.start.split(':').map(Number);
    const [endHour, endMinute] = businessHours.end.split(':').map(Number);
    
    const startTime = setMinutes(setHours(startOfDay(date), startHour), startMinute);
    const endTime = setMinutes(setHours(startOfDay(date), endHour), endMinute);
    
    // Get existing appointments for this date
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayAppointments = existingAppointments.filter(apt => apt.date === dateStr);
    
    // Check if we've reached the daily limit
    if (dayAppointments.length >= MAX_INSPECTIONS_PER_DAY) {
      setAvailableSlots([]);
      return;
    }

    let currentTime = startTime;
    let slotCount = 0;
    
    while (currentTime < endTime && slotCount < MAX_INSPECTIONS_PER_DAY) {
      const timeStr = format(currentTime, 'HH:mm');
      const totalDuration = INSPECTION_DURATION + WALKTHROUGH_DURATION;
      
      // Check if slot would end after business hours
      const slotEnd = addHours(currentTime, totalDuration / 60);
      if (slotEnd > endTime) {
        break;
      }
      
      // Check for conflicts with existing appointments
      const hasConflict = dayAppointments.some(apt => {
        const aptStart = setMinutes(setHours(startOfDay(date), parseInt(apt.time.split(':')[0])), parseInt(apt.time.split(':')[1]));
        const aptEnd = addHours(aptStart, apt.duration / 60);
        return currentTime < aptEnd && slotEnd > aptStart;
      });
      
      const isFirstOfDay = dayAppointments.length === 0;
      const needsTravelTime = !isFirstOfDay;
      
      slots.push({
        time: timeStr,
        available: !hasConflict,
        isFirstSlot: isFirstOfDay,
        travelTime: needsTravelTime
      });
      
      if (!hasConflict) {
        slotCount++;
      }
      
      // Move to next possible slot (considering travel time if needed)
      const increment = needsTravelTime ? totalDuration + TRAVEL_TIME : totalDuration;
      currentTime = addHours(currentTime, increment / 60);
    }
    
    setAvailableSlots(slots);
  };

  const isDateDisabled = (date) => {
    const today = startOfDay(new Date());
    const twoWeeksOut = addDays(today, 14);
    
    // Disable if before tomorrow or after 2 weeks
    if (date <= today || date > twoWeeksOut) {
      return true;
    }
    
    // Disable Sundays
    if (format(date, 'EEEE') === 'Sunday') {
      return true;
    }
    
    return false;
  };

  const handleDateSelect = (date) => {
    if (date && !isDateDisabled(date)) {
      setSelectedDate(date);
      setSelectedTime('');
    }
  };

  const handleScheduleInspection = () => {
    if (!selectedDate || !selectedTime || !occupancyStatus) {
      toast({
        title: "Missing Information",
        description: "Please select a date, time, and occupancy status.",
        variant: "destructive",
      });
      return;
    }

    if (occupancyStatus === 'vacant' && allowEarlyInspection === null) {
      toast({
        title: "Missing Information",
        description: "Please indicate if you allow early inspection for vacant properties.",
        variant: "destructive",
      });
      return;
    }

    const appointmentData = {
      property,
      date: format(selectedDate, 'yyyy-MM-dd'),
      time: selectedTime,
      occupancyStatus,
      allowEarlyInspection: occupancyStatus === 'vacant' ? allowEarlyInspection : null,
      inspectionDuration: INSPECTION_DURATION,
      walkthroughDuration: WALKTHROUGH_DURATION,
      totalDuration: INSPECTION_DURATION + WALKTHROUGH_DURATION,
      scheduledAt: new Date().toISOString(),
      businessEmails: [
        'cdchomeinspections@gmail.com',
        'cdcqualitycontrol@gmail.com'
      ]
    };

    onScheduled(appointmentData);
  };

  const getDateDisplayClass = (date) => {
    if (isDateDisabled(date)) {
      return 'text-gray-400 cursor-not-allowed';
    }
    
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayAppointments = existingAppointments.filter(apt => apt.date === dateStr);
    
    if (dayAppointments.length >= MAX_INSPECTIONS_PER_DAY) {
      return 'text-red-500 bg-red-50';
    } else if (dayAppointments.length > 0) {
      return 'text-orange-500 bg-orange-50';
    }
    
    return 'text-green-600 bg-green-50';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-blue-600" />
            Schedule Your Inspection
          </CardTitle>
          <CardDescription>
            Select your preferred date and time. We're available Monday-Saturday with up to 3 inspections per day.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="h-4 w-4 text-gray-600" />
              <span className="font-medium">{property.address}</span>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>{property.squareFootage?.toLocaleString()} sq ft</span>
              <span>{property.propertyType}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium mb-3">Select Date</h3>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                disabled={isDateDisabled}
                className="rounded-md border"
                modifiers={{
                  fullyBooked: (date) => {
                    const dateStr = format(date, 'yyyy-MM-dd');
                    const dayAppointments = existingAppointments.filter(apt => apt.date === dateStr);
                    return dayAppointments.length >= MAX_INSPECTIONS_PER_DAY;
                  },
                  partiallyBooked: (date) => {
                    const dateStr = format(date, 'yyyy-MM-dd');
                    const dayAppointments = existingAppointments.filter(apt => apt.date === dateStr);
                    return dayAppointments.length > 0 && dayAppointments.length < MAX_INSPECTIONS_PER_DAY;
                  }
                }}
                modifiersClassNames={{
                  fullyBooked: 'bg-red-100 text-red-700',
                  partiallyBooked: 'bg-orange-100 text-orange-700'
                }}
              />
              
              <div className="mt-3 space-y-1 text-xs text-gray-600">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-100 border border-green-300 rounded"></div>
                  <span>Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-orange-100 border border-orange-300 rounded"></div>
                  <span>Partially booked</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-100 border border-red-300 rounded"></div>
                  <span>Fully booked</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-3">Available Times</h3>
              {selectedDate ? (
                <div className="space-y-2">
                  {availableSlots.length > 0 ? (
                    availableSlots.map((slot) => (
                      <Button
                        key={slot.time}
                        variant={selectedTime === slot.time ? "default" : "outline"}
                        onClick={() => slot.available && setSelectedTime(slot.time)}
                        disabled={!slot.available}
                        className="w-full justify-start text-left"
                      >
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            <span>{slot.time}</span>
                            {slot.isFirstSlot && (
                              <Badge variant="secondary" className="text-xs">Available</Badge>
                            )}
                          </div>
                          <div className="text-xs text-gray-500">
                            2.5 hrs total
                            {slot.travelTime && " + 1hr travel"}
                          </div>
                        </div>
                      </Button>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      {format(selectedDate, 'EEEE') === 'Sunday' ? (
                        <div className="flex items-center justify-center gap-2">
                          <AlertCircle className="h-5 w-5" />
                          <span>We're closed on Sundays</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-2">
                          <AlertCircle className="h-5 w-5" />
                          <span>No available slots for this date</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <CalendarIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <span>Please select a date first</span>
                </div>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-3">Property Occupancy</h3>
            <Select value={occupancyStatus} onValueChange={setOccupancyStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Select occupancy status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="occupied">Occupied</SelectItem>
                <SelectItem value="vacant">Vacant</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {occupancyStatus === 'vacant' && (
            <Card className="border-orange-200 bg-orange-50">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <Home className="h-5 w-5 text-orange-600 mt-0.5" />
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium text-orange-900">Early Inspection Available</h4>
                      <p className="text-sm text-orange-700">
                        Since the property is vacant, if the inspector has time before your scheduled appointment, 
                        would you like for him to complete your inspection sooner? This may result in the ability 
                        to conduct a walkthrough.
                      </p>
                    </div>
                    <div className="flex gap-4">
                      <Button
                        variant={allowEarlyInspection === true ? "default" : "outline"}
                        size="sm"
                        onClick={() => setAllowEarlyInspection(true)}
                      >
                        Yes, allow early
                      </Button>
                      <Button
                        variant={allowEarlyInspection === false ? "default" : "outline"}
                        size="sm"
                        onClick={() => setAllowEarlyInspection(false)}
                      >
                        No, keep scheduled time
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {selectedDate && selectedTime && (
            <Card className="border-green-200 bg-green-50">
              <CardContent className="pt-6">
                <h4 className="font-medium text-green-900 mb-2">Inspection Summary</h4>
                <div className="space-y-1 text-sm text-green-700">
                  <div>Date: {format(selectedDate, 'EEEE, MMMM dd, yyyy')}</div>
                  <div>Start Time: {selectedTime}</div>
                  <div>Inspection Duration: 2 hours</div>
                  <div>Customer Walkthrough: 30 minutes</div>
                  <div>Total Time: 2.5 hours</div>
                  {occupancyStatus === 'vacant' && allowEarlyInspection && (
                    <div className="text-orange-700">* Early inspection allowed if time permits</div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-between pt-6">
            <Button variant="outline" onClick={onBack}>
              Back to Contact Info
            </Button>
            <Button 
              onClick={handleScheduleInspection}
              disabled={!selectedDate || !selectedTime || !occupancyStatus || 
                       (occupancyStatus === 'vacant' && allowEarlyInspection === null)}
              className="bg-red-600 hover:bg-red-700"
            >
              Schedule Inspection
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}